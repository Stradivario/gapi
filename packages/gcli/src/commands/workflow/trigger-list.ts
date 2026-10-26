import { tap } from 'rxjs/operators';

import { Logger } from '~/services/log';

import { resolveWorkflow, withProject } from './helpers';
import { triggerRow } from './triggers';

export default (cmd: { project?: string; name?: string }) =>
  withProject(cmd.project, (projectId) =>
    resolveWorkflow(projectId, cmd.name).pipe(
      tap((w) =>
        w.triggers?.length
          ? Logger.table(w.triggers.map(triggerRow))
          : Logger.info(
              'No triggers. Add one with workflow:trigger:add --http or --cron "@daily".',
            ),
      ),
    ),
  );
