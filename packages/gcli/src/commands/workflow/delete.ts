import { switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { resolveWorkflow, withProject } from './helpers';

export default (cmd: { project?: string; name?: string }) =>
  withProject(cmd.project, (projectId) =>
    resolveWorkflow(projectId, cmd.name).pipe(
      switchMap((w) => GraphqlClienAPI.deleteWorkflow(projectId, w.id)),
      tap((w) => Logger.info(`Deleted workflow ${w.name} and its runs`)),
    ),
  );
