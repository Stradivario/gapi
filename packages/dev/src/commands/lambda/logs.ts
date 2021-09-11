import { IFissionLogsType } from '@introspection/index';
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
  const result = tap(({ data }: IFissionLogsType) => console.log(data));
  if (cmd.lambda) {
    return isMongoId(cmd.lambda)
      .pipe(
        switchMap((id) => GraphqlClienAPI.getLambdaLogs(id)),
        result,
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
              `No project id try with "gcli use --project your-project-id" to specify one  \n Hint: "gcli lambda:logs --name ${name} --project your-project-id"`,
            );
          }
          return throwError(error);
        }),

        switchMap((projectId) =>
          GraphqlClienAPI.getLambdaLogsByName(name, projectId),
        ),
        result,
      )
      .toPromise();
  }
  throw new Error('unable-to-load-lambda-logs');
};
