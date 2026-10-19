import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import {
  ClusterTargetOptions,
  parseIntOption,
  resolveClusterTarget,
} from './helpers/cluster-change';

/** gcli cluster:scale-events --cluster <id> [--limit n] - manual and
    autoscaler scale history, newest first. */
export default async (cmd: ClusterTargetOptions & { limit?: string }) => {
  const limit =
    cmd.limit === undefined ? 20 : parseIntOption('limit', cmd.limit, 1, 200);
  const { projectId, clusterId } = await resolveClusterTarget(cmd);
  const events = await lastValueFrom(
    GraphqlClienAPI.clusterScaleEvents(projectId, clusterId, limit),
  );
  Logger.log('-------------------');
  Logger.log('[Action][clusterScaleEvents]');
  if (!events.length) {
    Logger.info('No scale events yet.');
  } else {
    Logger.table(
      events.map((e) => ({
        at: e.createdAt,
        trigger: e.trigger,
        direction: e.direction,
        workers: `${e.fromWorkers} -> ${e.toWorkers}`,
        reason: e.reason ?? '',
        error: e.error ?? '',
      })),
    );
  }
  Logger.log('-------------------');
  return events;
};
