import { readFile, writeFile } from 'fs/promises';
import { from, lastValueFrom, Observable, timer } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import {
  formatEvent,
  isTerminal,
  newEvents,
  parseWorkflowFile,
  WorkflowFile,
} from './definition';
import { Workflow, WorkflowRun } from './types';

/** The project's workflow named `name` (the API takes ids). */
export const resolveWorkflow = (
  projectId: string,
  name?: string,
): Observable<Workflow> => {
  if (!name) {
    throw new Error('--name is required (see workflow:list)');
  }
  return GraphqlClienAPI.listWorkflows(projectId).pipe(
    map((workflows) => {
      const workflow = workflows.find((w) => w.name === name || w.id === name);
      if (!workflow) {
        throw new Error(
          `No workflow "${name}" in this project (see workflow:list)`,
        );
      }
      return workflow;
    }),
  );
};

export const withProject = <T>(
  project: string | undefined,
  fn: (projectId: string) => Observable<T>,
) => lastValueFrom(parseProjectId(project).pipe(switchMap(fn)));

export const readWorkflowFile = (path?: string): Observable<WorkflowFile> => {
  if (!path) {
    throw new Error('--file is required (a workflow YAML or JSON file)');
  }
  return from(readFile(path, 'utf8')).pipe(map(parseWorkflowFile));
};

export const writeTextFile = (path: string, text: string) =>
  from(writeFile(path, text, 'utf8'));

const POLL_MS = 2000;

/** Prints the run's events as they arrive until it is terminal, then the
    outcome. Returns the final run. */
export const followRun = (
  projectId: string,
  workflowId: string,
  runName: string,
): Observable<WorkflowRun> => {
  let printed = 0;
  return timer(0, POLL_MS).pipe(
    switchMap(() =>
      GraphqlClienAPI.getWorkflowRun(projectId, workflowId, runName),
    ),
    tap((run) => {
      for (const e of newEvents(run, printed)) {
        Logger.log(formatEvent(e));
        printed = Math.max(printed, e.seq);
      }
    }),
    filter((run) => isTerminal(run.phase)),
    take(1),
    tap(printRunResult),
  );
};

export const printRunResult = (run: WorkflowRun) => {
  Logger.log('-------------------');
  Logger.log(`Run ${run.name}: ${run.phase}`);
  if (run.errorType) {
    Logger.error(`${run.errorType}${run.cause ? `: ${run.cause}` : ''}`);
  }
  if (run.output !== undefined && run.output !== null) {
    Logger.log('Output:');
    Logger.log(JSON.stringify(run.output, null, 2));
  }
  Logger.log('-------------------');
};
