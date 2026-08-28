import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

export default (cmd: { project?: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.listRabbitMqInstances(projectId),
      ),
      tap((brokers) => {
        Logger.log('-------------------');
        Logger.log('[Action][listRabbitMqInstances]');
        if (!brokers?.length) {
          Logger.info(
            'No RabbitMQ brokers for this project yet. See rabbitmq:create.',
          );
        } else {
          Logger.table(
            brokers.map((b) => ({
              id: b.id,
              name: b.name,
              region: b.region,
              clusterName: b.clusterName ?? 'Shared',
              queues: b.queues?.length ?? 0,
            })),
          );
        }
        Logger.log('-------------------');
      }),
    ),
  );
