import { IFissionType } from '@introspection/index';
import { lastValueFrom, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { isMongoId, parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { loadSpec } from './helpers/load-spec';

export default async (cmd: {
  spec?: string;
  name?: string;
  project?: string;
  lambda?: string;
}) => {
  const table = tap((data: IFissionType) => {
    const columns: (keyof typeof data)[] = [
      'name',
      'projectId',
      'url',
      'method',
    ];
    Logger.log('-------------------');
    Logger.log('[Action][getLambda]');
    Logger.table([data], columns);
    Logger.log('-------------------');
  });

  if (cmd.lambda) {
    return lastValueFrom(
      isMongoId(cmd.lambda).pipe(
        switchMap((id) => GraphqlClienAPI.getLambda(id)),
        table,
      ),
    );
  }
  const spec = await lastValueFrom(loadSpec(cmd.spec));

  const name =
    typeof cmd.name === 'string'
      ? (cmd.name as never)
      : (spec.function?.name ?? spec.name);

  if (name) {
    return lastValueFrom(
      parseProjectId(cmd.project).pipe(
        catchError((error) => {
          if (!cmd.project) {
            return throwError(
              () =>
                `No project id try with "gcli use --project your-project-id" to specify one  \n Hint: "gcli lambda:get --name ${name} --project your-project-id"`,
            );
          }
          return throwError(() => error);
        }),
        switchMap((projectId) =>
          GraphqlClienAPI.getLambdaByName(name, projectId),
        ),
        table,
      ),
    );
  }
  throw new Error('unable-to-load-lambda');
};
