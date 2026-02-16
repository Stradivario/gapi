import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';
import { Unboxed } from '~/types';

export default (cmd: { project: string }) =>
  parseProjectId(cmd.project)
    .pipe(
      switchMap((projectId) => GraphqlClienAPI.listLambdas(projectId)),
      tap((data) => {
        const columns: (keyof Unboxed<typeof data>)[] = ['id', 'name', 'url'];
        Logger.log('-------------------');
        Logger.log('[Action][listLambdas]');
        Logger.table(data, columns);
        Logger.log('-------------------');
      }),
    )
    .toPromise();
