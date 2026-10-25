import { switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { resolveWorkflow, withProject } from './helpers';

export default (cmd: { project?: string; name?: string; limit?: string }) =>
  withProject(cmd.project, (projectId) =>
    resolveWorkflow(projectId, cmd.name).pipe(
      switchMap((w) =>
        GraphqlClienAPI.listWorkflowRuns(
          projectId,
          w.id,
          cmd.limit ? Number(cmd.limit) : undefined,
        ),
      ),
      tap((runs) =>
        runs.length
          ? Logger.table(
              runs.map((r) => ({
                run: r.name,
                phase: r.phase,
                started: r.startedAt ?? '',
                finished: r.finishedAt ?? '',
                error: r.errorType ?? '',
              })),
            )
          : Logger.info('No runs yet. Start one with workflow:run.'),
      ),
    ),
  );
