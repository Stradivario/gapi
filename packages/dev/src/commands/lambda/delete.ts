import { Command } from 'commander';
import { readFile } from 'fs';
import { from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { promisify } from 'util';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';

import { ConfigJSON } from './helpers';

export default async (cmd: Command) => {
  const spec = await from(
    promisify(readFile)(cmd.spec || 'spec.json', { encoding: 'utf-8' }),
  )
    .pipe(
      catchError(() => of('{}')),
      map((spec) => JSON.parse(spec) as ConfigJSON),
    )
    .toPromise();

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
