import { lastValueFrom, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';
import { Unboxed } from '~/types';

import { loadSpec } from '../../lambda/helpers/load-spec';

/** gcli cron:create --lambdaName <n> --triggerName <t> --cron '<expr>'
    Flags win; missing ones come from `triggers.time` of lambforge.yaml
    (or cron.yaml / --spec). */
export default (cmd: {
  spec?: string;
  project?: string;
  lambdaName?: string;
  triggerName?: string;
  cron?: string;
}) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        loadSpec(cmd.spec ?? 'cron.yaml').pipe(
          switchMap((data) =>
            GraphqlClienAPI.getLambdaByName(
              cmd?.lambdaName ?? data?.function?.name ?? data?.name,
              projectId,
            ).pipe(
              map((lambda) => {
                const fromSpec =
                  data?.triggers?.time ?? (data as typeof data.triggers.time);
                return {
                  lambdaName: lambda.name,
                  lambdaId: lambda.id,
                  cron: cmd.cron ?? fromSpec?.cron,
                  triggerName: cmd.triggerName ?? fromSpec?.triggerName,
                };
              }),
            ),
          ),
        ),
      ),
      switchMap(({ lambdaId, cron, triggerName, lambdaName }) =>
        !cron || !triggerName
          ? throwError(
              () =>
                new Error(
                  'cron:create needs --cron and --triggerName (or triggers.time.cron / triggerName in lambforge.yaml)',
                ),
            )
          : GraphqlClienAPI.createTimeTrigger({
              lambdaId,
              cron,
              triggerName,
            }).pipe(map((data) => ({ ...data, lambdaName }))),
      ),
      tap((data) => {
        const columns: (keyof Unboxed<typeof data>)[] = [
          'id',
          'lambdaName',
          'triggerName',
          'cron',
          'createdBy',
        ];
        Logger.log('-------------------');
        Logger.log('[Action][createTimeTrigger]');
        Logger.table([data], columns);
        Logger.log('-------------------');
      }),
    ),
  );
