import { IFissionType } from '@introspection/index';
import { from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { isMongoId, parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';

import { loadSpec } from './helpers/load-spec';

export default async (cmd: {
  spec?: string;
  name?: string;
  project?: string;
  lambda?: string;
  queryParams?: string;
  pathParams?: string;
  body?: string;
}) => {
  const processParameters = (lambda: IFissionType) =>
    of(lambda).pipe(
      map((lambda) => ({
        ...lambda,
        url: cmd.pathParams
          ? cmd.pathParams
              .split(';')
              .map((param) => param.split('='))
              .reduce(
                (prev, [key, value]) => prev.replace(key, value),
                lambda.url,
              )
          : lambda.url,
      })),
      switchMap((lambda) =>
        from(
          fetch([lambda.url, cmd.queryParams].filter((i) => !!i).join(''), {
            method: lambda.method,
            body: cmd.body,
          }),
        ).pipe(switchMap((res) => res.json())),
      ),
      tap(console.log),
    );
  if (cmd.lambda) {
    return isMongoId(cmd.lambda)
      .pipe(
        switchMap((id) =>
          GraphqlClienAPI.getLambda(id, ['id', 'url', 'method', 'params']),
        ),
        switchMap(processParameters),
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
          GraphqlClienAPI.getLambdaByName(name, projectId, [
            'id',
            'url',
            'method',
            'params',
          ]),
        ),
        switchMap(processParameters),
      )
      .toPromise();
  }
  throw new Error('unable-to-load-lambda');
};
