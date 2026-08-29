import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId, resolveClusterId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';
import { Unboxed } from '~/types';

export default (cmd: {
  project: string;
  clusterId?: string;
  clusterName?: string;
}) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        resolveClusterId(projectId, {
          clusterId: cmd.clusterId,
          clusterName: cmd.clusterName,
        }).pipe(
          switchMap((clusterId) =>
            GraphqlClienAPI.listLambdas(projectId, clusterId),
          ),
        ),
      ),
      tap((data) => {
        const columns: (keyof Unboxed<typeof data>)[] = [
          'id',
          'name',
          'url',
          'clusterId',
          'clusterName',
        ];
        Logger.log('-------------------');
        Logger.log('[Action][listLambdas]');
        Logger.table(data, columns);
        Logger.log('-------------------');
      }),
    ),
  );
