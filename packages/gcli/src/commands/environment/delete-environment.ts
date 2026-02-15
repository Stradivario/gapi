import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Unboxed } from '~/types';

import { loadEnvSpec } from '../lambda/helpers/load-spec';

export default (cmd: {
  spec: string;
  project: string;
  name: string;
  force: boolean;
}) =>
  parseProjectId(cmd.project)
    .pipe(
      switchMap(async (projectId) => ({
        projectId,
        force: cmd.force,
        ...(await loadEnvSpec(cmd.spec).toPromise()),
      })),
      switchMap(({ projectId, name, force }) =>
        GraphqlClienAPI.deleteEnvironment(name, projectId, force),
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
        console.log('[Action][deleteEnvironment]');
        console.table([data], columns);
        console.log('-------------------');
      }),
    )
    .toPromise();
