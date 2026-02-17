import { IFissionEnvironmentInputType } from '@introspection/index';
import { combineLatest, lastValueFrom } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';
import { Unboxed } from '~/types';

export default (
  cmd: { spec: string; project: string } & IFissionEnvironmentInputType,
) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        combineLatest([
          GraphqlClienAPI.listProjectTimeTriggers(projectId),
          GraphqlClienAPI.listLambdas(projectId),
        ]),
      ),
      map(([triggers, lambdas]) =>
        triggers.map((v) => ({
          lambdaName: lambdas.find((l) => l.id === v.lambdaId)?.name,
          ...v,
        })),
      ),
      tap((data) => {
        const columns: (keyof Unboxed<typeof data>)[] = [
          'id',
          'triggerName',
          'lambdaName',
          'cron',
        ];
        Logger.log('-------------------');
        Logger.log('[Action][listProjectTimeTriggers]');
        Logger.table(data, columns);
        Logger.log('-------------------');
      }),
    ),
  );
