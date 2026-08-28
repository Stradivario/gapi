import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

export default (cmd: { project?: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) => GraphqlClienAPI.projectClusters(projectId)),
      tap((clusters) => {
        Logger.log('-------------------');
        Logger.log('[Action][projectClusters]');
        if (!clusters?.length) {
          Logger.info(
            'No private clusters for this project yet - this project runs on the shared cluster. See cluster:create.',
          );
        } else {
          Logger.table(clusters, [
            'id',
            'name',
            'status',
            'region',
            'serverType',
            'endpoint',
          ] as never);
        }
        Logger.log('-------------------');
      }),
    ),
  );
