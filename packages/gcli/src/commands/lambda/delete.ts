import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';

import { loadSpec } from './helpers/load-spec';

export default async (cmd: {
  spec?: string;
  name?: string;
  project?: string;
}) => {
  const spec = await loadSpec(cmd.spec).toPromise();

  const name = typeof cmd.name === 'string' ? (cmd.name as never) : spec.name;

  return parseProjectId(cmd.project)
    .pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.deleteLambda({ name, projectId }),
      ),
      tap((data) => {
        const columns: (keyof typeof data)[] = [
          'name',
          'projectId',
          'url',
          'method',
        ];
        console.log('-------------------');
        console.log('[Action][deleteLambda]');
        console.table([data], columns);
        console.log('-------------------');
      }),
    )
    .toPromise();
};
