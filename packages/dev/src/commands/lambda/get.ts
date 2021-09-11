import { IFissionType } from '@introspection/index';
import { throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { isMongoId, parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';

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
    console.log('-------------------');
    console.log('[Action][getLambda]');
    console.table([data], columns);
    console.log('-------------------');
  });

  if (cmd.lambda) {
    return isMongoId(cmd.lambda)
      .pipe(
        switchMap((id) => GraphqlClienAPI.getLambda(id)),
        table,
      )
      .toPromise();
  }
  const spec = await loadSpec(cmd.spec).toPromise();

  const name = typeof cmd.name === 'string' ? (cmd.name as never) : spec.name;

  if (name) {
    return parseProjectId(cmd.project)
      .pipe(
        catchError((error) => {
          if (!cmd.project) {
            return throwError(
              `No project id try with "gcli use --project your-project-id" to specify one  \n Hint: "gcli lambda:get --name ${name} --project your-project-id"`,
            );
          }
          return throwError(error);
        }),
        switchMap((projectId) =>
          GraphqlClienAPI.getLambdaByName(name, projectId),
        ),
        table,
      )
      .toPromise();
  }
  throw new Error('unable-to-load-lambda');
};
