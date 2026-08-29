import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId, resolveClusterId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { loadSpec } from './helpers/load-spec';

export default async (cmd: {
  spec?: string;
  name?: string;
  project?: string;
  env?: string;
  clusterId?: string;
  clusterName?: string;
}) => {
  const spec = await lastValueFrom(loadSpec(cmd.spec));

  const name =
    typeof cmd.name === 'string'
      ? (cmd.name as never)
      : (spec.function?.name ?? spec.name);
  const env = cmd.env ?? spec.function?.env ?? spec.env;
  const clusterIdHint =
    cmd.clusterId ?? spec.function?.clusterId ?? spec.clusterId;
  const clusterNameHint =
    cmd.clusterName ?? spec.function?.clusterName ?? spec.clusterName;

  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        resolveClusterId(projectId, {
          clusterId: clusterIdHint,
          clusterName: clusterNameHint,
        }).pipe(
          switchMap((clusterId) =>
            GraphqlClienAPI.deleteLambda({ name, projectId, env, clusterId }),
          ),
        ),
      ),
      tap((data) => {
        const columns: (keyof typeof data)[] = [
          'name',
          'projectId',
          'url',
          'method',
        ];
        Logger.log('-------------------');
        Logger.log('[Action][deleteLambda]');
        Logger.table([data], columns);
        Logger.log('-------------------');
      }),
    ),
  );
};
