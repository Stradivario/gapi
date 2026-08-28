import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

export default (cmd: { project?: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) => GraphqlClienAPI.listInstalledPlugins(projectId)),
      tap((installed) => {
        Logger.log('-------------------');
        Logger.log('[Action][listInstalledPlugins]');
        if (!installed?.length) {
          Logger.info(
            'No plugins installed for this project yet. See plugin:install.',
          );
        } else {
          // A project may have the same plugin installed on several
          // clusters simultaneously - each row here is one installation.
          Logger.table(
            installed.map((i) => ({
              name: i.plugin?.name,
              clusterName: i.clusterName ?? 'Shared',
              installedAt: i.installedAt,
            })),
          );
        }
        Logger.log('-------------------');
      }),
    ),
  );
