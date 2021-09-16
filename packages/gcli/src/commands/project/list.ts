import { tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Unboxed } from '~/types';

export default async () =>
  GraphqlClienAPI.listProjects()
    .pipe(
      tap((project) => {
        const columns: (keyof Unboxed<typeof project>)[] = ['id', 'name'];

        console.log('-------------------');
        console.log('[Action][listProjects]');
        console.table(project, columns);
        console.log('-------------------');
      }),
    )
    .toPromise();
