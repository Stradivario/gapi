import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Unboxed } from '~/types';

import { loadEnvSpec } from '../lambda/helpers/load-spec';

export default (cmd: { project: string; spec: string; name: string }) =>
  parseProjectId(cmd.project)
    .pipe(
      switchMap(async (projectId) => ({
        projectId,
        name: cmd.name,
        ...(await loadEnvSpec(cmd.spec).toPromise()),
      })),
      switchMap(({ projectId, name }) =>
        GraphqlClienAPI.getEnvironment(cmd.name ?? name, projectId),
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
        console.log('[Action][getEnvironment]');
        console.table([data], columns);
        console.log('-------------------');
      }),
    )
    .toPromise();
