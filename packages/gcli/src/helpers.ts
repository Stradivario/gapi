/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from 'commander';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { readFileAsObservable } from './commands/lambda/helpers/read-file';
import { GraphqlClienAPI } from './services/gql-client';
import { Logger } from './services/log';
import { projectDirectory } from './types';

export class CustomError extends Error {
  get name(): string {
    return this.constructor.name;
  }
}

export class ExitCodeError extends CustomError {
  readonly code: number;

  constructor(code: number, command?: string) {
    if (command) {
      super(`Command '${command}' exited with code ${code}`);
    } else {
      super(`Child exited with code ${code}`);
    }
    this.code = code;
  }
}

export function exitWithError(error: Error): never {
  if (error instanceof ExitCodeError) {
    Logger.error(error.message);
    process.exit(error.code);
  } else {
    Logger.error(error);
    process.exit(1);
  }
}
export function lazy(
  getActionFunc: () => Promise<(...args: any[]) => Promise<unknown>>,
): (...args: any[]) => Promise<void> {
  return async (...args: any[]) => {
    try {
      const actionFunc = await getActionFunc();
      await actionFunc(...args);

      process.exit(0);
    } catch (e) {
      const error = e as Error;
      exitWithError(error);
    }
  };
}

export const isMongoId = (mongoId: string) =>
  of(mongoId.trim()).pipe(
    switchMap((id) =>
      of(new RegExp('^[0-9a-fA-F]{24}$').test(id)).pipe(
        switchMap((isMongoId) =>
          isMongoId ? of(id) : throwError(() => `not-valid-id`),
        ),
      ),
    ),
  );

export function parseProjectId(projectId?: string) {
  return readFileAsObservable(projectDirectory).pipe(
    catchError(() => of('')),
    map((currentProjectId) => (projectId ? projectId : currentProjectId)),
    switchMap((id) =>
      typeof id !== 'string' ? throwError(() => 'no-id-provided') : of(id),
    ),
    switchMap((id) => isMongoId(id)),
  );
}

/**
 * Resolves the clusterId disambiguation hint every clusterId-aware command
 * accepts. `clusterId` is the authoritative field (a project's clusters are
 * really identified by their Mongo _id) and always wins when both are
 * given - `clusterName` is a convenience for humans writing/reading
 * lambforge.yaml or typing a flag, since a project's cluster NAMES are
 * unique too (name + projectId is enough to resolve one unambiguously).
 *
 * `undefined` passes through as `undefined` (each backend query/mutation
 * gives that its own meaning - usually "no hint"/"every cluster"), and an
 * explicit `''` (some commands use it to mean "the shared cluster only")
 * passes through unchanged too - only a genuinely empty/unset `clusterId`
 * falls through to trying `clusterName`.
 */
export function resolveClusterId(
  projectId: string,
  hint: { clusterId?: string | null; clusterName?: string | null },
): Observable<string | undefined> {
  if (hint.clusterId != null) {
    return of(hint.clusterId);
  }
  if (!hint.clusterName) {
    return of(undefined);
  }
  return GraphqlClienAPI.projectClusters(projectId).pipe(
    map((clusters) => clusters.find((c) => c.name === hint.clusterName)),
    switchMap((cluster) =>
      cluster?.id
        ? of(cluster.id)
        : throwError(
            () =>
              `No cluster named "${hint.clusterName}" found in this project - run "gcli cluster:list --project ${projectId}" to see available clusters.`,
          ),
    ),
  );
}

export function outputAllHelp(cmd: Command) {
  cmd.outputHelp();
  cmd.commands.forEach((subCmd) => {
    Logger.info('\n--- Subcommand: ' + subCmd.name() + ' ---');
    outputAllHelp(subCmd);
  });
}
