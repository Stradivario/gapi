import { IFissionEnvironmentInputType } from '@introspection/index';
import { lastValueFrom } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId, resolveClusterId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';
import { Unboxed } from '~/types';

import { loadSpec } from '../lambda/helpers/load-spec';

export default (
  cmd: {
    spec: string;
    project: string;
    /* Human-readable alternative to --clusterId (see resolveClusterId) -
       DISAMBIGUATES which same-named environment this is; never applied to
       the environment itself (clusterId is immutable after creation). */
    clusterName?: string;
  } & IFissionEnvironmentInputType,
) => {
  const { clusterName: cmdClusterName, ...cmdRest } = cmd;
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        loadSpec(cmd.spec ?? 'env.yaml').pipe(
          map((data) => ({
            projectId,
            ...(data?.environment ?? data),
          })),
        ),
      ),
      tap(Logger.log),
      switchMap(({ projectId, clusterName: dataClusterName, ...data }) =>
        resolveClusterId(projectId, {
          clusterId: cmdRest.clusterId || data.clusterId,
          clusterName: cmdClusterName || dataClusterName,
        }).pipe(
          switchMap((clusterId) =>
            GraphqlClienAPI.updateEnvironment(projectId, {
              ...data,
              ...cmdRest,
              clusterId,
            }),
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
          'clusterId',
          'clusterName',
        ];
        Logger.log('-------------------');
        Logger.log('[Action][updateEnvironment]');
        Logger.table([data], columns);
        Logger.log('-------------------');
      }),
    ),
  );
};
