import { lastValueFrom } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId, resolveClusterId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';
import { Unboxed } from '~/types';

import { loadSpec } from '../lambda/helpers/load-spec';

export default (cmd: {
  spec: string;
  project: string;
  name: string;
  force: boolean;
  clusterId?: string;
  clusterName?: string;
}) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        loadSpec(cmd.spec ?? 'env.yaml').pipe(
          map((data) => ({
            projectId,
            ...(data?.environment ?? data),
          })),
        ),
      ),
      switchMap(({ projectId, name }) =>
        resolveClusterId(projectId, {
          clusterId: cmd.clusterId,
          clusterName: cmd.clusterName,
        }).pipe(
          switchMap((clusterId) =>
            GraphqlClienAPI.deleteEnvironment(
              name,
              projectId,
              cmd.force,
              clusterId,
            ),
          ),
        ),
      ),
      tap((data) => {
        const columns: (keyof Unboxed<typeof data>)[] = [
          'id',
          'name',
          'image',
          'builder',
          'poolSize',
          'minCpu',
          'maxCpu',
          'minMemory',
          'maxMemory',
          'region',
        ];
        Logger.log('-------------------');
        Logger.log('[Action][deleteEnvironment]');
        Logger.table([data], columns);
        Logger.log('-------------------');
      }),
    ),
  );
