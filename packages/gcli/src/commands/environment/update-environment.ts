import { IFissionEnvironmentInputType } from '@introspection/index';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Unboxed } from '~/types';

import { loadEnvSpec } from '../lambda/helpers/load-spec';

export default (
  cmd: { spec: string; project: string } & IFissionEnvironmentInputType,
) =>
  parseProjectId(cmd.project)
    .pipe(
      switchMap(async (projectId) => ({
        projectId,
        ...(await loadEnvSpec(cmd.spec).toPromise()),
      })),
      switchMap(({ projectId, ...data }) =>
        GraphqlClienAPI.updateEnvironment(projectId, {
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
        console.log('-------------------');
        console.log('[Action][updateEnvironment]');
        console.table([data], columns);
        console.log('-------------------');
      }),
    )
    .toPromise();
