import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { loadSpec } from './helpers/load-spec';

export default async (cmd: {
  spec?: string;
  name?: string;
  project?: string;
}) => {
  const spec = await lastValueFrom(loadSpec(cmd.spec));

  const name =
    typeof cmd.name === 'string'
      ? (cmd.name as never)
      : (spec.function?.name ?? spec.name);

  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
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
        Logger.log('-------------------');
        Logger.log('[Action][deleteLambda]');
        Logger.table([data], columns);
        Logger.log('-------------------');
      }),
    ),
  );
};
