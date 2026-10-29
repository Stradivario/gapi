import { ClusterAutoscalePolicy, ClusterChange } from '../types';

/**
 * The desired state of a private cluster - the `cluster:` section of
 * lambforge.yaml (or cluster.yaml). `cluster:apply` reconciles the real
 * cluster towards it; `cluster:create` reads the same section once.
 */
export interface ClusterDesired {
  name: string;
  /* 'vcluster' = a virtual cluster (own Kubernetes API + Fission, no
     servers) on `host`. Omitted = a private Talos cluster. */
  provider?: 'vcluster';
  /* Virtual clusters only: name of one of the project's private clusters
     to run on. Omitted = the shared Lambforge cluster. */
  host?: string;
  /* Needed only when the cluster does not exist yet. */
  imageId?: string;
  serverType?: string;
  location?: string;
  singleNode?: boolean;
  /* Worker nodes 1-10. With autoscale.enabled it is only the initial size. */
  workers?: number;
  /* 1, 3 or 5. */
  controlPlanes?: number;
  /* Talos: the cluster's LB. Virtual cluster: its DEDICATED LB (own IP,
     billed) - the platform subdomain works either way. */
  loadBalancer?: boolean;
  autoscale?: Omit<
    ClusterAutoscalePolicy,
    'lastScaledAt' | 'lastEvaluatedAt' | 'lastDecision'
  >;
}

/** The current state `cluster:apply` reads (projectClusters). */
export type ClusterCurrent = ClusterChange & {
  autoscale?: ClusterAutoscalePolicy | null;
};

export type ClusterStep =
  | { kind: 'create'; description: string }
  | { kind: 'multi-node'; workers: number; description: string }
  | { kind: 'single-node'; description: string; destructive: true }
  | { kind: 'scale'; workers: number; description: string }
  | { kind: 'control-planes'; count: number; description: string }
  | {
      kind: 'load-balancer';
      enabled: boolean;
      description: string;
      destructive?: true;
    }
  | {
      kind: 'autoscale';
      input: ClusterAutoscalePolicy;
      description: string;
    };

export interface ClusterPlan {
  steps: ClusterStep[];
  notes: string[];
}

const AUTOSCALE_BOUNDS: Record<string, [number, number]> = {
  minWorkers: [1, 10],
  maxWorkers: [1, 10],
  cpuScaleUpPercent: [1, 100],
  memScaleUpPercent: [1, 100],
  cpuScaleDownPercent: [1, 100],
  memScaleDownPercent: [1, 100],
  samplesToScale: [1, 20],
  cooldownMinutes: [1, 1440],
};

const VIRTUAL_UNSUPPORTED = [
  'imageId',
  'serverType',
  'location',
  'singleNode',
  'workers',
  'controlPlanes',
  'autoscale',
] as const;

const intIn = (v: unknown, min: number, max: number) =>
  Number.isInteger(v) && (v as number) >= min && (v as number) <= max;

/** Readable errors for a desired state the server would refuse anyway. */
export const validateDesired = (d: ClusterDesired): string[] => {
  const errors: string[] = [];
  if (!d?.name) errors.push('cluster.name is required');
  if (d.provider !== undefined && d.provider !== 'vcluster') {
    errors.push("cluster.provider must be 'vcluster' (or omitted)");
  }
  if (d.provider === 'vcluster') {
    // A virtual cluster has no servers: none of the node settings apply.
    for (const key of VIRTUAL_UNSUPPORTED) {
      if (d[key] !== undefined) {
        errors.push(`cluster.${key} does not apply to a virtual cluster`);
      }
    }
    return errors;
  }
  if (d.host !== undefined) {
    errors.push("cluster.host needs provider: 'vcluster'");
  }
  if (d.workers !== undefined && !intIn(d.workers, 1, 10)) {
    errors.push('cluster.workers must be an integer from 1 to 10');
  }
  if (d.controlPlanes !== undefined && ![1, 3, 5].includes(d.controlPlanes)) {
    errors.push('cluster.controlPlanes must be 1, 3 or 5');
  }
  for (const [key, value] of Object.entries(d.autoscale ?? {})) {
    if (key === 'enabled') {
      if (typeof value !== 'boolean') {
        errors.push('cluster.autoscale.enabled must be true or false');
      }
      continue;
    }
    const bounds = AUTOSCALE_BOUNDS[key];
    if (!bounds) {
      errors.push(`cluster.autoscale.${key} is not a known setting`);
    } else if (!intIn(value, bounds[0], bounds[1])) {
      errors.push(
        `cluster.autoscale.${key} must be an integer from ${bounds[0]} to ${bounds[1]}`,
      );
    }
  }
  const a = d.autoscale ?? {};
  if (
    a.minWorkers !== undefined &&
    a.maxWorkers !== undefined &&
    a.maxWorkers < a.minWorkers
  ) {
    errors.push('cluster.autoscale.maxWorkers must be >= minWorkers');
  }
  if (d.singleNode && a.enabled) {
    errors.push(
      'cluster.autoscale.enabled needs a multi-node cluster (singleNode: false)',
    );
  }
  return errors;
};

/**
 * Ordered steps that turn `current` into `desired` (null = the cluster does
 * not exist yet). Each step is one cluster-provisioner job; the cluster must
 * be ready again before the next one, so the order matters: topology first,
 * then workers / control planes / load balancer, autoscaling last (it needs
 * a multi-node cluster). Keys missing from `desired` are left as they are.
 */
export const planClusterChanges = (
  current: ClusterCurrent | null,
  desired: ClusterDesired,
): ClusterPlan => {
  const steps: ClusterStep[] = [];
  const notes: string[] = [];
  const autoscaleOn = desired.autoscale?.enabled === true;

  if (desired.provider === 'vcluster') {
    // A virtual cluster has no nodes: only its existence and its dedicated
    // load balancer can be reconciled (it is created with the LB already).
    if (!current) {
      steps.push({
        kind: 'create',
        description: `create virtual cluster "${desired.name}" on ${
          desired.host ? `"${desired.host}"` : 'the shared cluster'
        }${desired.loadBalancer ? ' with a dedicated load balancer' : ''}`,
      });
    } else if (
      desired.loadBalancer !== undefined &&
      !!current.withLoadBalancer !== desired.loadBalancer
    ) {
      steps.push(
        desired.loadBalancer
          ? {
              kind: 'load-balancer',
              enabled: true,
              description:
                'add a dedicated load balancer (its own IP, billed; the subdomain stays)',
            }
          : {
              kind: 'load-balancer',
              enabled: false,
              description:
                'remove the dedicated load balancer (its IP is released; the subdomain stays)',
              destructive: true,
            },
      );
    }
    return { steps, notes };
  }

  if (!current) {
    steps.push({
      kind: 'create',
      description: `create cluster "${desired.name}"${
        desired.singleNode
          ? ' (single node)'
          : ` with ${desired.workers ?? desired.autoscale?.minWorkers ?? 1} worker(s)`
      }`,
    });
    // Created in the desired shape; only autoscaling is applied after.
    if (desired.autoscale && Object.keys(desired.autoscale).length) {
      steps.push({
        kind: 'autoscale',
        input: { ...desired.autoscale },
        description: 'set the autoscaling policy',
      });
    }
    return { steps, notes };
  }

  const topo = current.topology ?? {};
  const isSingle = !!topo.singleNode;
  let willBeSingle = isSingle;

  if (desired.singleNode === false && isSingle) {
    const workers = desired.workers ?? desired.autoscale?.minWorkers ?? 1;
    steps.push({
      kind: 'multi-node',
      workers,
      description: `convert to multi-node with ${workers} worker(s)`,
    });
    willBeSingle = false;
  } else if (desired.singleNode === true && !isSingle) {
    steps.push({
      kind: 'single-node',
      description: `convert to a single node (removes ${topo.workers ?? 'the'} worker node(s))`,
      destructive: true,
    });
    willBeSingle = true;
  }

  const convertedToMulti = steps.some((s) => s.kind === 'multi-node');
  if (desired.workers !== undefined && !willBeSingle && !convertedToMulti) {
    if (autoscaleOn) {
      notes.push(
        'workers is ignored while autoscale.enabled is true - the autoscaler owns the worker count (set autoscale.minWorkers/maxWorkers instead)',
      );
    } else if (topo.workers !== desired.workers) {
      steps.push({
        kind: 'scale',
        workers: desired.workers,
        description: `scale workers ${topo.workers ?? '?'} -> ${desired.workers}`,
      });
    }
  } else if (desired.workers !== undefined && willBeSingle) {
    notes.push('workers is ignored for a single-node cluster');
  }

  if (
    desired.controlPlanes !== undefined &&
    (topo.controlPlanes ?? 1) !== desired.controlPlanes
  ) {
    steps.push({
      kind: 'control-planes',
      count: desired.controlPlanes,
      description: `control planes ${topo.controlPlanes ?? 1} -> ${desired.controlPlanes}`,
    });
  }

  if (
    desired.loadBalancer !== undefined &&
    !!current.withLoadBalancer !== desired.loadBalancer
  ) {
    steps.push(
      desired.loadBalancer
        ? {
            kind: 'load-balancer',
            enabled: true,
            description: 'add the load balancer',
          }
        : {
            kind: 'load-balancer',
            enabled: false,
            description: 'remove the load balancer (its IP is released)',
            destructive: true,
          },
    );
  }

  if (desired.autoscale) {
    const now = current.autoscale ?? {};
    const changed: ClusterAutoscalePolicy = {};
    for (const [key, value] of Object.entries(desired.autoscale)) {
      if ((now as Record<string, unknown>)[key] !== value) {
        (changed as Record<string, unknown>)[key] = value;
      }
    }
    if (Object.keys(changed).length) {
      steps.push({
        kind: 'autoscale',
        input: changed,
        description: `autoscale: ${Object.entries(changed)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')}`,
      });
    }
  }

  return { steps, notes };
};
