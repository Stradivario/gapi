import { lastValueFrom } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { pollUntilReady } from './helpers/poll-until-ready';

export default async (cmd: {
  project?: string;
  cluster: string;
  wait?: boolean;
}) => {
  const { projectId, cluster } = await lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.teardownProjectCluster(projectId, cmd.cluster).pipe(
          map((cluster) => ({ projectId, cluster })),
        ),
      ),
      tap(({ cluster }) => {
        Logger.log('-------------------');
        Logger.log('[Action][teardownProjectCluster]');
        Logger.table([cluster]);
        Logger.log('-------------------');
        if (!cmd.wait) {
          Logger.info(
            "Teardown runs in the background - this takes a few minutes. Re-run with --wait to block until it's gone, or cluster:list to check progress.",
          );
        }
      }),
    ),
  );

  if (!cmd.wait) {
    return cluster;
  }

  Logger.info(`Waiting for cluster ${cluster.id} to finish tearing down...`);
  const finalCluster = await pollUntilReady(projectId, cluster.id);
  Logger.log(
    `[Action][teardownProjectCluster] final status: ${finalCluster.status}`,
  );
  return finalCluster;
};
