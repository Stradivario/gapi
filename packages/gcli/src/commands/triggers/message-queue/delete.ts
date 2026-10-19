import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

export default (cmd: { project?: string; name: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.deleteMessageQueueTrigger(projectId, cmd.name),
      ),
      tap((trigger) => {
        Logger.log('-------------------');
        Logger.log('[Action][deleteMessageQueueTrigger]');
        Logger.info(
          `Deleted trigger ${trigger?.name ?? cmd.name}${trigger?.lambdaName ? ` (lambda ${trigger.lambdaName})` : ''}`,
        );
        Logger.log('-------------------');
      }),
    ),
  );
