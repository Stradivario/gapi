import { lastValueFrom, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { parseProjectId, resolveClusterId } from '~/helpers';
import { Logger } from '~/services/log';

import { ClusterChange } from '../types';
import { pollUntilReady } from './poll-until-ready';

export interface ClusterTargetOptions {
  project?: string;
  cluster?: string;
  clusterName?: string;
}

/** projectId + clusterId from --project/--cluster/--clusterName (a cluster
    is required: these commands always act on one cluster). */
export const resolveClusterTarget = async (cmd: ClusterTargetOptions) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        resolveClusterId(projectId, {
          clusterId: cmd.cluster,
          clusterName: cmd.clusterName,
        }).pipe(
          map((clusterId) => {
            if (!clusterId) {
              throw new Error(
                'Pass --cluster <id> or --clusterName <name> (see gcli cluster:list).',
              );
            }
            return { projectId, clusterId };
          }),
        ),
      ),
    ),
  );

/** An integer option in [min, max], or a readable error. */
export const parseIntOption = (
  name: string,
  value: unknown,
  min: number,
  max: number,
): number => {
  const n = Number(value);
  if (value === undefined || value === null || value === '') {
    throw new Error(`--${name} is required`);
  }
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(`--${name} must be an integer from ${min} to ${max}`);
  }
  return n;
};

export const describeChange = (cluster: ClusterChange) => ({
  id: cluster.id,
  name: cluster.name,
  status: cluster.status,
  workers: cluster.topology?.workers,
  singleNode: cluster.topology?.singleNode,
  controlPlanes: cluster.topology?.controlPlanes,
  loadBalancer: cluster.withLoadBalancer,
  error: cluster.error ?? '',
});

/**
 * Runs a cluster mutation that starts a background job, prints the result,
 * and with --wait blocks until the cluster settles (ready / error).
 */
export const runClusterChange = async (
  action: string,
  projectId: string,
  change$: Observable<ClusterChange>,
  wait?: boolean,
) => {
  const cluster = await lastValueFrom(change$);
  Logger.log('-------------------');
  Logger.log(`[Action][${action}]`);
  Logger.table([describeChange(cluster)]);
  Logger.log('-------------------');
  if (!wait) {
    if (cluster.status !== 'ready') {
      Logger.info(
        'This runs in the background. Re-run with --wait to block until it settles, or check gcli cluster:status.',
      );
    }
    return cluster;
  }
  Logger.info(`Waiting for cluster ${cluster.id} to settle...`);
  const final = await pollUntilReady(projectId, cluster.id);
  Logger.log(`[Action][${action}] final status: ${final.status}`);
  if (final.status === 'error') {
    throw new Error(
      `Cluster ${cluster.id} ended in "error"${final.error ? `: ${final.error}` : ''}`,
    );
  }
  return final;
};
