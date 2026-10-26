import { readFile } from 'fs/promises';
import { from, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { resolveWorkflow, withProject } from './helpers';
import { buildTriggerInput, TriggerAddOptions, triggerRow } from './triggers';

export default (
  cmd: TriggerAddOptions & {
    project?: string;
    name?: string;
    inputFile?: string;
  },
) =>
  withProject(cmd.project, (projectId) =>
    (cmd.inputFile
      ? from(readFile(cmd.inputFile, 'utf8'))
      : of(undefined)
    ).pipe(
      map((inputText) => buildTriggerInput({ ...cmd, inputText })),
      switchMap((trigger) =>
        resolveWorkflow(projectId, cmd.name).pipe(
          switchMap((w) =>
            GraphqlClienAPI.addWorkflowTrigger(projectId, w.id, trigger).pipe(
              map((updated) => ({ before: w.triggers ?? [], updated })),
            ),
          ),
        ),
      ),
      tap(({ before, updated }) => {
        const added = (updated.triggers ?? []).find(
          (t) => !before.some((b) => b.id === t.id),
        );
        Logger.info(`Trigger added to ${updated.name}`);
        if (added) {
          Logger.table([triggerRow(added)]);
          if (added.kind === 'http' && added.url) {
            Logger.log(
              `Start a run: curl -X ${(added.methods ?? ['POST'])[0]} '${added.url}' -H 'Content-Type: application/json' -d '{}'`,
            );
          }
        }
      }),
    ),
  );
