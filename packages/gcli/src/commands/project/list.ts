import { lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';
import { Unboxed } from '~/types';

export default async () =>
  lastValueFrom(
    GraphqlClienAPI.listProjects().pipe(
      tap((project) => {
        const columns: (keyof Unboxed<typeof project>)[] = ['id', 'name'];

        Logger.log('-------------------');
        Logger.log('[Action][listProjects]');
        Logger.table(project, columns);
        Logger.log('-------------------');
      }),
    ),
  );
