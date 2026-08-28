import { lastValueFrom } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { loadSpec } from '../lambda/helpers/load-spec';
import { pollUntilReady } from './helpers/poll-until-ready';

interface ClusterYamlSpec {
  name: string;
  imageId: string;
  serverType: string;
  location: string;
  workers?: number;
  singleNode?: boolean;
}

export default async (
  cmd: {
    spec?: string;
    project?: string;
    wait?: boolean;
  } & Partial<ClusterYamlSpec>,
) => {
  const result = await lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        loadSpec<{ cluster?: ClusterYamlSpec } & Partial<ClusterYamlSpec>>(
          cmd.spec ?? 'cluster.yaml',
        ).pipe(
          map((data) => ({
            projectId,
            ...(data ? (data.cluster ?? data) : {}),
          })),
        ),
      ),
      switchMap(({ projectId, ...data }) =>
        GraphqlClienAPI.provisionProjectCluster(projectId, {
          name: cmd.name || data.name,
          imageId: cmd.imageId || data.imageId,
          serverType: cmd.serverType || data.serverType,
          location: cmd.location || data.location,
          workers: cmd.workers ?? data.workers,
          singleNode: cmd.singleNode ?? data.singleNode,
        }).pipe(map((cluster) => ({ projectId, cluster }))),
      ),
      tap(({ cluster }) => {
        Logger.log('-------------------');
        Logger.log('[Action][provisionProjectCluster]');
        Logger.table([cluster]);
        Logger.log('-------------------');
        if (!cmd.wait) {
          Logger.info(
            `Provisioning runs in the background - this takes several minutes. Re-run with --wait to block until it's ready, or 'cluster:list --project ${cluster.projectId}' to check progress.`,
          );
        }
      }),
    ),
  );

  if (!cmd.wait) {
    return result.cluster;
  }

  Logger.info(`Waiting for cluster ${result.cluster.id} to become ready...`);
  const finalCluster = await pollUntilReady(
    result.projectId,
    result.cluster.id,
  );
  Logger.log('-------------------');
  Logger.log(
    `[Action][provisionProjectCluster] final status: ${finalCluster.status}`,
  );
  Logger.table([finalCluster]);
  Logger.log('-------------------');
  return finalCluster;
};
