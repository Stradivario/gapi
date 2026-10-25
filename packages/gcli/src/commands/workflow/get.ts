import { of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { Logger } from '~/services/log';

import { toWorkflowYaml } from './definition';
import { resolveWorkflow, withProject, writeTextFile } from './helpers';

/** Prints (or writes with -o) the workflow as the file workflow:apply reads. */
export default (cmd: { project?: string; name?: string; out?: string }) =>
  withProject(cmd.project, (projectId) =>
    resolveWorkflow(projectId, cmd.name).pipe(
      switchMap((w) => {
        const text = toWorkflowYaml({
          name: w.name,
          description: w.description ?? undefined,
          definition: w.definition,
        });
        if (!cmd.out) {
          Logger.log(text);
          return of(null);
        }
        return writeTextFile(cmd.out, text).pipe(
          tap(() => Logger.info(`Wrote ${cmd.out}`)),
        );
      }),
    ),
  );
