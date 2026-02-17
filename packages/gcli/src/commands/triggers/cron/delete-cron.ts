import { IFissionEnvironmentInputType } from '@introspection/index';
import { lastValueFrom } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';
import { Unboxed } from '~/types';

import { loadSpec } from '../../lambda/helpers/load-spec';

export default (
  cmd: {
    spec: string;
    project: string;
    lambdaName: string;
  } & IFissionEnvironmentInputType,
) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        loadSpec(cmd.spec ?? 'cron.yaml').pipe(
          switchMap((data) =>
            GraphqlClienAPI.getLambdaByName(
              cmd?.lambdaName ?? data?.function?.name ?? data?.name,
              projectId,
            ).pipe(
              map((lambda) => ({
                lambdaName: lambda.name,
                lambdaId: lambda.id,
              })),
            ),
          ),
        ),
      ),
      switchMap(({ lambdaId, lambdaName }) =>
        GraphqlClienAPI.deleteLambdaTimeTrigger(lambdaId).pipe(
          map((data) => ({ ...data, lambdaName })),
        ),
      ),
      tap((data) => {
        const columns: (keyof Unboxed<typeof data>)[] = [
          'id',
          'lambdaName',
          'triggerName',
          'cron',
        ];
        Logger.log('-------------------');
        Logger.log('[Action][deleteLambdaTimeTrigger]');
        Logger.table([data], columns);
        Logger.log('-------------------');
      }),
    ),
  );
