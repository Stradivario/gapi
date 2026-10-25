import { switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { formatEvent } from './definition';
import {
  followRun,
  printRunResult,
  resolveWorkflow,
  withProject,
} from './helpers';

export default (cmd: {
  project?: string;
  name?: string;
  run?: string;
  follow?: boolean;
}) =>
  withProject(cmd.project, (projectId) => {
    if (!cmd.run) {
      throw new Error('--run is required (see workflow:runs)');
    }
    return resolveWorkflow(projectId, cmd.name).pipe(
      switchMap((w) =>
        cmd.follow
          ? followRun(projectId, w.id, cmd.run)
          : GraphqlClienAPI.getWorkflowRun(projectId, w.id, cmd.run).pipe(
              tap((run) => {
                (run.events ?? []).forEach((e) => Logger.log(formatEvent(e)));
                printRunResult(run);
              }),
            ),
      ),
    );
  });
