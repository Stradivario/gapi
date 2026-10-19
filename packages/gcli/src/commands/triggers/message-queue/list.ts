import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

export default (cmd: { project?: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.listMessageQueueTriggers(projectId),
      ),
      tap((triggers) => {
        Logger.log('-------------------');
        Logger.log('[Action][listMessageQueueTriggers]');
        if (!triggers?.length) {
          Logger.info('No message-queue triggers yet. See mq-trigger:create.');
        } else {
          Logger.table(
            triggers.map((t) => ({
              name: t.name,
              lambda: t.lambdaName,
              requestTopic: t.requestTopic,
              responseTopic: t.responseTopic ?? '',
              errorTopic: t.errorTopic ?? '',
              cluster: t.clusterName ?? 'Shared',
            })),
          );
        }
        Logger.log('-------------------');
      }),
    ),
  );
