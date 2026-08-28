import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

export default (cmd: { project?: string; id: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.uninstallRabbitMq(cmd.id, projectId),
      ),
      tap((broker) => {
        Logger.log('-------------------');
        Logger.log('[Action][uninstallRabbitMq]');
        Logger.table([broker]);
        Logger.log('-------------------');
      }),
    ),
  );
