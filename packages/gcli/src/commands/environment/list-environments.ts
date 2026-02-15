import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Unboxed } from '~/types';

export default (cmd: { project: string }) =>
  parseProjectId(cmd.project)
    .pipe(
      switchMap((projectId) => GraphqlClienAPI.listEnvironments(projectId)),
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
        console.log('[Action][listEnvironments]');
        console.table(data, columns);
        console.log('-------------------');
      }),
    )
    .toPromise();
