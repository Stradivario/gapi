import { ICluster } from '@introspection/index';
import { firstValueFrom, throwError, timer } from 'rxjs';
import { first, switchMap, tap, timeout } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

const TERMINAL_STATUSES = ['ready', 'error', 'deleted'];

/**
 * No existing "wait for async resource" pattern in this CLI (confirmed) -
 * cluster provisioning/teardown runs in the background on the server and
 * takes minutes, unlike every other gcli mutation which completes inline.
 * Polls `projectClusters` (there's no singular by-id status query) and
 * filters down to the one cluster being watched.
 */
export function pollUntilReady(
  projectId: string,
  clusterId: string,
  { intervalMs = 5000, timeoutMs = 20 * 60 * 1000 } = {},
): Promise<ICluster> {
  return firstValueFrom(
    timer(0, intervalMs).pipe(
      switchMap(() => GraphqlClienAPI.projectClusters(projectId)),
      switchMap((clusters) => {
        const cluster = (clusters || []).find((c) => c.id === clusterId);
        if (!cluster) {
          throw new Error(`cluster ${clusterId} not found`);
        }
        return [cluster];
      }),
      tap((cluster) =>
        Logger.info(`[cluster ${clusterId}] status: ${cluster.status}`),
      ),
      first((cluster) => TERMINAL_STATUSES.includes(cluster.status)),
      timeout({
        each: timeoutMs,
        with: () =>
          throwError(
            () =>
              new Error(
                `Timed out after ${timeoutMs}ms waiting for cluster ${clusterId} to reach a terminal status.`,
              ),
          ),
      }),
    ),
  );
}
