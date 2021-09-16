import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Unboxed } from '~/types';

export default (cmd: { project: string }) =>
  parseProjectId(cmd.project)
    .pipe(
      switchMap((projectId) => GraphqlClienAPI.listLambdas(projectId)),
      tap((data) => {
        const columns: (keyof Unboxed<typeof data>)[] = ['id', 'name', 'url'];
        console.log('-------------------');
        console.log('[Action][listLambdas]');
        console.table(data, columns);
        console.log('-------------------');
      }),
    )
    .toPromise();
