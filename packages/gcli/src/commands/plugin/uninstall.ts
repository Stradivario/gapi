import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

export default (cmd: { project?: string; name: string; cluster?: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.uninstallPlugin(projectId, cmd.name, cmd.cluster),
      ),
      tap((pluginName) => {
        Logger.log('-------------------');
        Logger.log(`[Action][uninstallPlugin] removed ${pluginName}`);
        Logger.log('-------------------');
      }),
    ),
  );
