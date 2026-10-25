import { readFile } from 'fs/promises';
import { from, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { parseRunInput } from './definition';
import { followRun, resolveWorkflow, withProject } from './helpers';

export default (cmd: {
  project?: string;
  name?: string;
  input?: string;
  inputFile?: string;
  wait?: boolean;
}) =>
  withProject(cmd.project, (projectId) =>
    (cmd.inputFile
      ? from(readFile(cmd.inputFile, 'utf8'))
      : of(cmd.input)
    ).pipe(
      map(parseRunInput),
      switchMap((input) =>
        resolveWorkflow(projectId, cmd.name).pipe(
          switchMap((w) =>
            GraphqlClienAPI.startWorkflowRun(projectId, w.id, input).pipe(
              tap((run) => Logger.info(`Started run ${run.name}`)),
              switchMap((run) =>
                cmd.wait
                  ? followRun(projectId, w.id, run.name)
                  : of(run).pipe(
                      tap(() =>
                        Logger.info(
                          `Follow it: gcli workflow:status --name ${w.name} --run ${run.name} --follow`,
                        ),
                      ),
                    ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
