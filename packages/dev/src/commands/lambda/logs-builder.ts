import { IFissionLogsType } from '@introspection/index';
import { Command } from 'commander';
import { readFile } from 'fs';
import { from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { promisify } from 'util';

import { isMongoId, parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';

import { ConfigJSON } from './helpers';

export default async (cmd: Command) => {
  const result = tap(({ data }: IFissionLogsType) => process.stdin.write(data));
  if (cmd.lambda) {
    return isMongoId(cmd.lambda)
      .pipe(
        switchMap((id) => GraphqlClienAPI.getLambdaBuilderLogs(id)),
        result,
      )
      .toPromise();
  }
  const spec = await from(
    promisify(readFile)(cmd.spec || 'spec.json', { encoding: 'utf-8' }),
  )
    .pipe(
      catchError(() => of('{}')),
      map((spec) => JSON.parse(spec) as ConfigJSON),
    )
    .toPromise();

  const name = typeof cmd.name === 'string' ? (cmd.name as never) : spec.name;

  if (name) {
    return parseProjectId(cmd.project)
      .pipe(
        catchError((error) => {
          if (!cmd.project) {
            return throwError(
              `No project id try with "gcli use --project your-project-id" to specify one  \n Hint: "gcli lambda:logs --name ${name} --project your-project-id"`,
            );
          }
          return throwError(error);
        }),

        switchMap((projectId) =>
          GraphqlClienAPI.getLambdaBuilderLogsByName(name, projectId),
        ),
        result,
      )
      .toPromise();
  }
  throw new Error('unable-to-load-lambda-logs');
};
