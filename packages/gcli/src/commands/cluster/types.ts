/**
 * Shapes of the cluster-provisioner operations the scaling / health
 * commands use. Local (like commands/runner/types.ts) because these fields
 * (controlPlanes, autoscale, the overview) are newer than the generated
 * @introspection types. Mirrors gql-fission's
 * core/services/cluster/{mutations,queries}/*.graphql.
 */

export const ClusterChangeFragment = `
id
projectId
name
status
region
serverType
topology {
  workers
  singleNode
  controlPlanes
}
withLoadBalancer
loadBalancerIp
error
`;

export const ClusterAutoscaleFragment = `
enabled
scalingProfile
serverTypes
scaleUpStep
mode
consolidation
minNodeAgeMinutes
pools {
  name
  serverTypes
  labels {
    key
    value
  }
  taints {
    key
    value
    effect
  }
  maxWorkers
  weight
}
minWorkers
maxWorkers
cpuScaleUpPercent
memScaleUpPercent
cpuScaleDownPercent
memScaleDownPercent
samplesToScale
cooldownMinutes
lastScaledAt
lastEvaluatedAt
lastDecision
`;

export const ClusterOverviewFragment = `
clusterId
name
status
overall
agentOnline
agentLastSeenAt
agentVersion
health {
  reportedAt
  nodesTotal
  nodesReady
  nodesSchedulable
  pods
  pendingPods
  cpuRequestsPercent
  memRequestsPercent
  cpuUsagePercent
  memUsagePercent
  fissionReady
  prometheusReady
  kubernetesVersion
}
autoscale {
  enabled
  minWorkers
  maxWorkers
  lastDecision
  lastScaledAt
}
monthToDate {
  period
  nodeHours
  loadBalancerHours
  totalCostEur
  totalCostUsd
}
estimatedMonthlyCostEur
issues {
  severity
  code
  message
}
`;

export const ClusterHealthFragment = `
id
clusterId
createdAt
agentVersion
kubernetesVersion
pods
pendingPods
fissionReady
prometheusReady
metricsAvailable
cpuRequestsPercent
memRequestsPercent
cpuUsagePercent
memUsagePercent
nodes {
  name
  role
  ready
  instanceType
  cpuRequests
  cpuUsage
  cpuAllocatable
  memRequests
  memUsage
  memAllocatable
  podCount
  cordoned
}
`;

export const ClusterScaleEventFragment = `
createdAt
trigger
direction
fromWorkers
toWorkers
reason
cpuRequestsPercent
memRequestsPercent
pendingPods
error
`;

export interface ClusterChange {
  id: string;
  projectId?: string;
  name: string;
  status: string;
  region?: string;
  serverType?: string;
  topology?: {
    workers?: number;
    singleNode?: boolean;
    controlPlanes?: number;
  };
  withLoadBalancer?: boolean;
  loadBalancerIp?: string | null;
  error?: string | null;
}

export type ScalingProfile =
  | 'conservative'
  | 'balanced'
  | 'aggressive'
  | 'custom';

export const SCALING_PROFILES: ScalingProfile[] = [
  'conservative',
  'balanced',
  'aggressive',
  'custom',
];

export interface ClusterNodePool {
  name: string;
  serverTypes: string[];
  labels?: Array<{ key: string; value: string }>;
  taints?: Array<{ key: string; value?: string; effect: string }>;
  maxWorkers?: number;
  weight?: number;
}

export interface ClusterAutoscalePolicy {
  enabled?: boolean;
  /** Presets thresholds/heartbeats/cooldown/step; 'custom' = as typed. */
  scalingProfile?: ScalingProfile;
  /** Worker server types in order of preference (next one on no stock). */
  serverTypes?: string[];
  /** Workers added per scale-up (1-3). */
  scaleUpStep?: number;
  /** 'thresholds' | 'pods' (plan 17: nodes for unschedulable pods). */
  mode?: 'thresholds' | 'pods';
  /** pods mode: remove the newest worker when its pods fit elsewhere. */
  consolidation?: boolean;
  minNodeAgeMinutes?: number;
  /** pods mode: extra node pools (replaces the list). */
  pools?: ClusterNodePool[];
  minWorkers?: number;
  maxWorkers?: number;
  cpuScaleUpPercent?: number;
  memScaleUpPercent?: number;
  cpuScaleDownPercent?: number;
  memScaleDownPercent?: number;
  samplesToScale?: number;
  cooldownMinutes?: number;
  lastScaledAt?: string | null;
  lastEvaluatedAt?: string | null;
  lastDecision?: string | null;
}

export interface ClusterOverview {
  clusterId: string;
  name: string;
  status: string;
  overall: string;
  agentOnline?: boolean;
  agentLastSeenAt?: string | null;
  agentVersion?: string | null;
  health?: {
    reportedAt?: string;
    nodesTotal?: number;
    nodesReady?: number;
    nodesSchedulable?: number;
    pods?: number;
    pendingPods?: number;
    cpuRequestsPercent?: number;
    memRequestsPercent?: number;
    cpuUsagePercent?: number;
    memUsagePercent?: number;
    fissionReady?: boolean;
    prometheusReady?: boolean;
    kubernetesVersion?: string;
  } | null;
  autoscale?: {
    enabled?: boolean;
    minWorkers?: number;
    maxWorkers?: number;
    lastDecision?: string | null;
    lastScaledAt?: string | null;
  } | null;
  monthToDate?: {
    period?: string;
    nodeHours?: number;
    loadBalancerHours?: number;
    totalCostEur?: number;
    totalCostUsd?: number;
  } | null;
  estimatedMonthlyCostEur?: number | null;
  issues?: { severity: string; code: string; message: string }[];
}

export interface ClusterHealthNode {
  name: string;
  role?: string;
  ready?: boolean;
  instanceType?: string;
  cpuRequests?: number;
  cpuUsage?: number;
  cpuAllocatable?: number;
  memRequests?: number;
  memUsage?: number;
  memAllocatable?: number;
  podCount?: number;
  cordoned?: boolean;
}

export interface ClusterHealthSnapshot {
  id: string;
  clusterId: string;
  createdAt: string;
  agentVersion?: string;
  kubernetesVersion?: string;
  pods?: number;
  pendingPods?: number;
  fissionReady?: boolean;
  prometheusReady?: boolean;
  metricsAvailable?: boolean;
  cpuRequestsPercent?: number;
  memRequestsPercent?: number;
  cpuUsagePercent?: number;
  memUsagePercent?: number;
  nodes?: ClusterHealthNode[];
}

export interface ClusterScaleEvent {
  createdAt: string;
  trigger?: string;
  direction?: string;
  fromWorkers?: number;
  toWorkers?: number;
  reason?: string | null;
  cpuRequestsPercent?: number;
  memRequestsPercent?: number;
  pendingPods?: number;
  error?: string | null;
}

/* self-managed-nodes: machines attached to a Talos cluster (cluster-provisioner) */
export const ClusterNodeFragment = `
name
pool
reserved
status
cordoned
internalIp
cpuCores
memoryGb
osImage
kubeletVersion
joinedAt
addedAt
recorded
source
role
`;

export interface ClusterNode {
  name: string;
  pool?: string | null;
  reserved: boolean;
  /** 'joining' | 'ready' | 'not-ready' | 'detached' */
  status: string;
  cordoned: boolean;
  internalIp?: string | null;
  cpuCores?: number | null;
  memoryGb?: number | null;
  osImage?: string | null;
  kubeletVersion?: string | null;
  joinedAt?: string | null;
  addedAt?: string | null;
  recorded: boolean;
  /** 'own' (an attached machine) | 'hetzner' (a server the platform provisioned) */
  source?: string;
  /** 'control-plane' | 'worker' */
  role?: string;
}

export interface ClusterTalosconfig {
  /** a credential (OS-level admin of the cluster's machines) - private file only */
  talosconfig: string;
  expiresAt: string;
  endpoint: string;
  talosVersion?: string | null;
}

export interface ClusterNodeJoinConfig {
  clusterName: string;
  nodeName: string;
  pool: string;
  reserved: boolean;
  /** Talos machine config with the cluster join token - apply, never keep. */
  config: string;
  talosVersion?: string | null;
  isoUrl?: string | null;
  isoUrlArm64?: string | null;
  endpoint?: string | null;
}
