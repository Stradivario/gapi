import { lastValueFrom, Observable } from 'rxjs';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { loadSpec } from '../lambda/helpers/load-spec';
import { runClusterChange } from './helpers/cluster-change';
import {
  ClusterCurrent,
  ClusterDesired,
  ClusterStep,
  planClusterChanges,
  validateDesired,
} from './helpers/plan';
import { pollUntilReady } from './helpers/poll-until-ready';
import { provisionVirtualCluster } from './helpers/virtual-cluster';
import { ClusterChange } from './types';

const readDesired = async (spec?: string): Promise<ClusterDesired> => {
  const data = await lastValueFrom(
    loadSpec<{ cluster?: ClusterDesired } & Partial<ClusterDesired>>(
      spec ?? 'cluster.yaml',
    ),
  );
  const desired = data ? (data.cluster ?? (data as ClusterDesired)) : null;
  if (!desired?.name) {
    throw new Error(
      'No cluster to apply: add a `cluster:` section with at least `name` to lambforge.yaml (or pass --spec cluster.yaml)',
    );
  }
  return desired;
};

/**
 * gcli cluster:apply [--spec lambforge.yaml] [--dry-run] [--yes]
 *
 * Reconciles the named private cluster to the `cluster:` section: creates
 * it when missing, then applies topology, workers, control planes, load
 * balancer and autoscaling - one background job at a time, waiting for the
 * cluster to be ready between them. Steps that remove capacity or release
 * the load balancer IP need --yes.
 */
export default async (cmd: {
  project?: string;
  spec?: string;
  dryRun?: boolean;
  yes?: boolean;
}) => {
  const desired = await readDesired(cmd.spec);
  const errors = validateDesired(desired);
  if (errors.length) {
    throw new Error(`Invalid cluster spec:\n- ${errors.join('\n- ')}`);
  }
  const projectId = await lastValueFrom(parseProjectId(cmd.project));
  const clusters = await lastValueFrom(
    GraphqlClienAPI.projectClustersDetailed(projectId),
  );
  const current =
    (clusters.find(
      (c) => c.name === desired.name && c.status !== 'deleted',
    ) as ClusterCurrent) ?? null;

  if (current && current.status !== 'ready' && !cmd.dryRun) {
    throw new Error(
      `Cluster "${current.name}" is "${current.status}" - wait until it is ready (gcli cluster:status) and apply again`,
    );
  }

  const { steps, notes } = planClusterChanges(current, desired);
  Logger.log('-------------------');
  Logger.log(`[Action][clusterApply] ${desired.name}`);
  notes.forEach((n) => Logger.warn(`note: ${n}`));
  if (!steps.length) {
    Logger.info('Nothing to change - the cluster already matches the spec.');
    Logger.log('-------------------');
    return { cluster: current, applied: [] as ClusterStep[] };
  }
  Logger.table(
    steps.map((s, i) => ({
      step: i + 1,
      change: s.description,
      needsYes: 'destructive' in s && s.destructive ? 'yes' : '',
    })),
  );
  Logger.log('-------------------');
  if (cmd.dryRun) {
    Logger.info('--dry-run: nothing was changed.');
    return { cluster: current, applied: [] as ClusterStep[] };
  }

  if (!current && desired.provider !== 'vcluster') {
    const missing = (['imageId', 'serverType', 'location'] as const).filter(
      (k) => !desired[k],
    );
    if (missing.length) {
      throw new Error(
        `Cluster "${desired.name}" does not exist - creating it needs ${missing
          .map((k) => `cluster.${k}`)
          .join(', ')} in the spec`,
      );
    }
  }

  const applied: ClusterStep[] = [];
  let clusterId = current?.id;
  for (const step of steps) {
    if ('destructive' in step && step.destructive && !cmd.yes) {
      Logger.warn(`skipped (re-run with --yes to apply): ${step.description}`);
      continue;
    }
    Logger.info(`-> ${step.description}`);
    if (step.kind === 'create') {
      const created =
        desired.provider === 'vcluster'
          ? await provisionVirtualCluster(
              projectId,
              desired.name,
              desired.host,
              desired.loadBalancer,
            )
          : await lastValueFrom(
              GraphqlClienAPI.provisionProjectCluster(projectId, {
                name: desired.name,
                imageId: desired.imageId,
                serverType: desired.serverType,
                location: desired.location,
                workers: desired.singleNode
                  ? undefined
                  : (desired.workers ?? desired.autoscale?.minWorkers),
                singleNode: desired.singleNode,
                withLoadBalancer: desired.loadBalancer,
                controlPlanes: desired.controlPlanes,
              }),
            );
      clusterId = created.id;
      Logger.info('Provisioning - this takes several minutes...');
      const ready = await pollUntilReady(projectId, clusterId);
      if (ready.status !== 'ready') {
        throw new Error(
          `Cluster "${desired.name}" ended in "${ready.status}"${ready.error ? `: ${ready.error}` : ''}`,
        );
      }
    } else if (step.kind === 'autoscale') {
      await lastValueFrom(
        GraphqlClienAPI.updateProjectClusterAutoscale(
          projectId,
          clusterId,
          step.input,
        ),
      );
    } else {
      const change$: Observable<ClusterChange> =
        step.kind === 'multi-node'
          ? GraphqlClienAPI.migrateToMultiNodeProjectCluster(
              projectId,
              clusterId,
              step.workers,
            )
          : step.kind === 'single-node'
            ? GraphqlClienAPI.revertToSingleNodeProjectCluster(
                projectId,
                clusterId,
              )
            : step.kind === 'scale'
              ? GraphqlClienAPI.scaleProjectCluster(
                  projectId,
                  clusterId,
                  step.workers,
                )
              : step.kind === 'control-planes'
                ? GraphqlClienAPI.scaleControlPlanesProjectCluster(
                    projectId,
                    clusterId,
                    step.count,
                  )
                : GraphqlClienAPI.setProjectClusterLoadBalancer(
                    projectId,
                    clusterId,
                    step.enabled,
                  );
      await runClusterChange(step.kind, projectId, change$, true);
    }
    applied.push(step);
  }
  Logger.info(
    `Applied ${applied.length} of ${steps.length} change(s) to "${desired.name}".`,
  );
  return { clusterId, applied };
};
