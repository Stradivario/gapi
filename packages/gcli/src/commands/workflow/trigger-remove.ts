import { switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { resolveWorkflow, withProject } from './helpers';
import { findTrigger } from './triggers';

export default (cmd: { project?: string; name?: string; trigger?: string }) =>
  withProject(cmd.project, (projectId) =>
    resolveWorkflow(projectId, cmd.name).pipe(
      switchMap((w) =>
        GraphqlClienAPI.removeWorkflowTrigger(
          projectId,
          w.id,
          findTrigger(w.triggers, cmd.trigger).id,
        ),
      ),
      tap((w) =>
        Logger.info(
          `Trigger removed from ${w.name} (${w.triggers?.length ?? 0} left)`,
        ),
      ),
    ),
  );
