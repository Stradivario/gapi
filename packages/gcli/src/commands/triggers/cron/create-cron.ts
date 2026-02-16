import { IFissionEnvironmentInputType } from '@introspection/index';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';
import { Unboxed } from '~/types';

import { loadSpec } from '../../lambda/helpers/load-spec';

export default (
  cmd: { spec: string; project: string } & IFissionEnvironmentInputType,
) =>
  parseProjectId(cmd.project)
    .pipe(
      switchMap((projectId) =>
        loadSpec(cmd.spec ?? 'trigger.yaml').pipe(
          map((data) => ({
            projectId,
            ...(data?.trigger ?? data),
          })),
        ),
      ),
      switchMap(({ projectId, ...data }) =>
        GraphqlClienAPI.createEnvironment(projectId, {
          ...data,
          ...cmd,
        }),
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
        Logger.log('[Action][createEnvironment]');
        Logger.table([data], columns);
        Logger.log('-------------------');
      }),
    )
    .toPromise();
