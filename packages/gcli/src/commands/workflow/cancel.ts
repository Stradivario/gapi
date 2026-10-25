import { switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { resolveWorkflow, withProject } from './helpers';

export default (cmd: { project?: string; name?: string; run?: string }) =>
  withProject(cmd.project, (projectId) => {
    if (!cmd.run) {
      throw new Error('--run is required (see workflow:runs)');
    }
    return resolveWorkflow(projectId, cmd.name).pipe(
      switchMap((w) =>
        GraphqlClienAPI.cancelWorkflowRun(projectId, w.id, cmd.run),
      ),
      tap((run) => Logger.info(`Run ${run.name}: ${run.phase}`)),
    );
  });
