import { readFile } from 'fs/promises';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { applyWorkflow } from './apply';
import { parseWorkflowFile, toWorkflowYaml, WorkflowFile } from './definition';
import { resolveWorkflow, withProject, writeTextFile } from './helpers';

/**
 * AI draft (MiniMax, through graphql-server): from plain language, or a
 * change to an existing workflow (--name) or file (--from). Prints the
 * explanation and notes, writes the YAML (-o) or prints it, and saves it
 * only with --apply.
 */
export default (cmd: {
  project?: string;
  description?: string;
  name?: string;
  from?: string;
  out?: string;
  apply?: boolean;
}) =>
  withProject(cmd.project, (projectId) => {
    if (!cmd.description?.trim()) {
      throw new Error(
        'Describe the workflow: --description "charge the card with retries, then email the receipt"',
      );
    }
    const base$: Observable<WorkflowFile | null> = cmd.from
      ? from(readFile(cmd.from, 'utf8')).pipe(map(parseWorkflowFile))
      : cmd.name
        ? GraphqlClienAPI.listWorkflows(projectId).pipe(
            switchMap((workflows) =>
              workflows.some((w) => w.name === cmd.name)
                ? resolveWorkflow(projectId, cmd.name).pipe(
                    map((w) => ({
                      name: w.name,
                      description: w.description ?? undefined,
                      definition: w.definition,
                    })),
                  )
                : of(null),
            ),
          )
        : of(null);
    return base$.pipe(
      tap(() => Logger.info('Asking the AI for a draft...')),
      switchMap((base) =>
        GraphqlClienAPI.generateWorkflowDraft(
          projectId,
          cmd.description,
          base?.definition,
        ).pipe(
          map((draft) => ({
            draft,
            file: {
              name: cmd.name ?? base?.name,
              description: base?.description,
              definition: draft.definition,
            } as WorkflowFile,
          })),
        ),
      ),
      tap(({ draft }) => {
        if (draft.explanation) Logger.log(draft.explanation);
        (draft.warnings ?? [])
          .filter(Boolean)
          .forEach((w) => Logger.warn(`- ${w}`));
      }),
      switchMap(({ file }) => {
        const text = toWorkflowYaml(file);
        const written$ = cmd.out
          ? writeTextFile(cmd.out, text).pipe(
              tap(() => Logger.info(`Wrote ${cmd.out}`)),
            )
          : of(null).pipe(tap(() => !cmd.apply && Logger.log(text)));
        return written$.pipe(
          switchMap(() =>
            cmd.apply
              ? applyWorkflow(projectId, file)
              : of(null).pipe(
                  tap(() =>
                    Logger.info(
                      cmd.out
                        ? `Review it, then: gcli workflow:apply --file ${cmd.out}${file.name ? '' : ' --name <name>'}`
                        : 'Save it with -o <file>, or re-run with --apply --name <name>',
                    ),
                  ),
                ),
          ),
        );
      }),
    );
  });
