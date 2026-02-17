import { IFissionType, IHttpMethodsEnum } from '@introspection/index';
import { from, lastValueFrom, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { isMongoId, parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { loadSpec } from './helpers/load-spec';

export default async (cmd: {
  spec?: string;
  name?: string;
  project?: string;
  lambda?: string;
  queryParams?: string;
  pathParams?: string;
  method?: IHttpMethodsEnum;
  body?: string;
}) => {
  const spec = await lastValueFrom(loadSpec(cmd.spec));

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
      tap(() => {
        Logger.info(
          `About to hit URL: ${[lambda.url, cmd.queryParams].join('')}`,
        );
      }),
      switchMap((lambda) =>
        from(
          fetch([lambda.url, cmd.queryParams].filter((i) => !!i).join(''), {
            method: cmd?.method ?? 'GET',
            body: cmd.body,
          }),
        ).pipe(switchMap((res) => res.json())),
      ),
      tap((data) => {
        if (data.error) {
          Logger.error(data);
        } else {
          Logger.info(data);
        }
      }),
    );
  if (cmd.lambda) {
    return lastValueFrom(
      isMongoId(cmd.lambda).pipe(
        switchMap((id) =>
          GraphqlClienAPI.getLambda(id, ['id', 'url', 'method', 'params']),
        ),
        switchMap(processParameters),
      ),
    );
  }

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
          GraphqlClienAPI.getLambdaByName(name, projectId, [
            'id',
            'url',
            'method',
            'params',
          ]),
        ),
        switchMap(processParameters),
      ),
    );
  }
  throw new Error('unable-to-load-lambda');
};
