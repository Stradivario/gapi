import {
  IGraphqlFile,
  IHttpMethodsEnum,
  ILambdaScaleOptionsExecutorTypeEnum,
} from '@introspection/index';
import { Command } from 'commander';
import FormData from 'form-data';
import { createReadStream, ReadStream, WriteStream } from 'fs';
import fetch from 'node-fetch';
import {
  defer,
  forkJoin,
  lastValueFrom,
  Observable,
  of,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  finalize,
  last,
  map,
  switchMap,
  takeWhile,
  tap,
  timeout,
} from 'rxjs/operators';
import streamToBuffer from 'stream-to-buffer';

import { applyDomains } from '~/commands/domain/apply';
import { parseProjectId, ReportedError, resolveClusterId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import {
  bytes,
  elapsed,
  errorText,
  humanOutputToStderr,
  step,
  ui,
} from '~/services/ui';

import { packageArchive } from '../package';
import { deployStateOf } from './deploy-state';
import { DomainConfig, loadSpec } from './load-spec';
import { readFileAsObservable } from './read-file';
import { spreadScaleOptions } from './spread';
import { DesiredTimeTrigger, syncTimeTrigger } from './time-trigger-sync';

export { spreadScaleOptions };

const ReadFile = (file: string): Observable<string> =>
  readFileAsObservable(file).pipe(catchError(() => of('')));

export interface CreateOrUpdateLambdaArguments {
  project: string;
  spec: string;
  file: string;
  code: string;
  name: string;
  route: string;
  script: string;
  buildBashScript: string;
  configs: string[];
  secrets: string[];
  envSecrets: string[];
  bodyLimit?: string;
  network: string[];
  env: string;
  /* Explicit disambiguation hint: which of the project's clusters `env`
     lives on (omit for the shared cluster). Only needed once a project has
     private clusters and a duplicate-named environment across them (e.g.
     after a resource migration) makes name-only resolution ambiguous.
     clusterId is authoritative and wins if both are given; clusterName is a
     human-readable alternative (a project's cluster names are unique too -
     see resolveClusterId) for a more readable lambforge.yaml/flag. */
  clusterId?: string;
  clusterName?: string;
  method: IHttpMethodsEnum[];
  packageJson: string;
  package: string;
  params: string[];
  customUploadFileId: string;
  /* Federation gateway (from lambforge.yaml `function.federation` / `function.subgraphs`) */
  federation?: boolean;
  subgraphs?: string[];
  /* MCP server (from lambforge.yaml `function.mcp*`). Operations/headers are spec-only (yaml/json). */
  mcp?: boolean;
  mcpGraph?: string;
  cache?: boolean;
  /* Scale options */
  minCpu: number;
  maxCpu: number;
  minMemory: number;
  maxMemory: number;
  minScale: number;
  maxScale: number;
  targetCpu: number;
  executorType: ILambdaScaleOptionsExecutorTypeEnum;
  idleTimeout: number;
  concurrency: number;
  functionTimeout: number;
  specializationTimeout: number;
  /* `--no-wait`: return once saved, without following the build */
  wait?: boolean;
  /* `--json`: the saved lambda as JSON on stdout, progress on stderr */
  json?: boolean;
  /* inside a bigger flow (gcli apply): no header, no closing summary */
  embedded?: boolean;
  /* Replicas across machines (plan 33): 'machines' | 'none' */
  spread?: string;
  /* 'true' / 'false' from the flag, boolean from the spec */
  spreadStrict?: string | boolean;
}

export function streamToBufferPromise(file: File | ReadStream | WriteStream) {
  return new Promise<Buffer>((resolve, reject) => {
    streamToBuffer(file, function (err, buffer: Buffer) {
      if (err) {
        return reject(err);
      }
      resolve(buffer);
    });
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type LambdaSpec = Record<string, any> & { projectId: string };
type SavedLambda = {
  id?: string | null;
  name?: string | null;
  url?: string | null;
  deployStatus?: string | null;
};

/** What a deploy sends (flags win over lambforge.yaml). */
const lambdaPayload = (
  cmd: CreateOrUpdateLambdaArguments,
  payload: LambdaSpec,
  clusterId: string | undefined,
  files: { code: string; script: string; packageJson: string },
) => ({
  code: cmd.code || files.code || '',
  name: cmd.name || payload.name || '',
  projectId: payload.projectId,
  route: cmd.route || payload.route || '',
  buildBashScript: cmd.buildBashScript || files.script || '',
  configs: cmd.configs || payload.configs || [],
  env: cmd.env || payload.env || 'nodejs',
  method: cmd.method || payload.method || ['GET'],
  packageJson: cmd.packageJson || files.packageJson || '{}',
  params: cmd.params || payload.params || [],
  secrets: cmd.secrets || payload.secrets || [],
  envSecrets: cmd.envSecrets || payload.envSecrets || [],
  /* Only sent when set, so gcli still works against an API
       without the field. */
  ...((cmd.bodyLimit ?? payload.bodyLimit)
    ? { bodyLimit: String(cmd.bodyLimit ?? payload.bodyLimit) }
    : {}),
  clusterId,

  network: cmd.network || payload.network || ['public', 'private'],
  federation: cmd.federation ?? !!payload.federation,
  subgraphs: cmd.subgraphs || payload.subgraphs || [],
  /* MCP server — operations/headers come from the spec (yaml/json); mcp/mcpGraph also accept flags */
  mcp: cmd.mcp ?? !!payload.mcp,
  mcpGraph: cmd.mcpGraph || payload.mcpGraph || '',
  mcpOperations: payload.mcpOperations || [],
  mcpHeaders: payload.mcpHeaders || [],
  mcpForwardHeaders: payload.mcpForwardHeaders || [],
  cache: cmd.cache || payload.cache || false,
  customUploadFileId:
    cmd.customUploadFileId || payload.customUploadFileId || '',
  scaleOptions: {
    executorType:
      cmd.executorType || payload.scaleOptions?.executorType || 'poolmgr',
    maxCpu: cmd.maxCpu || payload.scaleOptions?.maxCpu || 0,
    maxMemory: cmd.maxMemory || payload.scaleOptions?.maxMemory || 0,
    maxScale: cmd.maxScale || payload.scaleOptions?.maxScale || 0,
    minCpu: cmd.minCpu || payload.scaleOptions?.minCpu || 0,
    minMemory: cmd.minMemory || payload.scaleOptions?.minMemory || 0,
    minScale: cmd.minScale || payload.scaleOptions?.minScale || 0,
    targetCpu: cmd.targetCpu || payload.scaleOptions?.targetCpu || 0,
    idleTimeout: cmd.idleTimeout || payload.scaleOptions?.idleTimeout || 120,
    // 0 = not set: the server fills these in within the project's
    // plan (concurrency <= 3, timeouts 60/120 s capped). A fixed
    // 500 / 60 / 120 here was refused on plans with lower maxima.
    concurrency: cmd.concurrency || payload.scaleOptions?.concurrency || 0,
    functionTimeout:
      cmd.functionTimeout || payload.scaleOptions?.functionTimeout || 0,
    specializationTimeout:
      cmd.specializationTimeout ||
      payload.scaleOptions?.specializationTimeout ||
      0,
    ...spreadScaleOptions(cmd, payload.scaleOptions),
  },
});

/** Archive packages: zip, then upload; the file id goes into the save. */
const uploadArchive = (
  cmd: CreateOrUpdateLambdaArguments,
  data: LambdaSpec,
  scope: string,
): Observable<LambdaSpec> =>
  packageArchive(cmd).pipe(
    step('packing archive', {
      scope,
      done: (s) => `archive packed (${s.files} files, ${bytes(s.bytes)})`,
    }),
    switchMap((stats) =>
      GraphqlClienAPI.getConfig().pipe(
        switchMap((config) => {
          const body = new FormData();
          body.append('file[]', createReadStream(stats.path));
          return defer(() =>
            fetch(config.uploadUrl, {
              method: 'POST',
              body: body as never,
              headers: {
                ...body.getHeaders(),
                Authorization: config.token,
                projectid: data.projectId,
                lambdaname: data.name,
              },
            }),
          );
        }),
        switchMap((res) =>
          defer(() => res.json() as Promise<IGraphqlFile>).pipe(
            catchError(() => of(null)),
            switchMap((file) =>
              res.ok && file?.id
                ? of({ ...data, customUploadFileId: file.id })
                : throwError(
                    () =>
                      new Error(
                        `the upload was refused (HTTP ${res.status}${(file as any)?.message ? `: ${(file as any).message}` : ''})`,
                      ),
                  ),
            ),
          ),
        ),
        step('uploading archive', {
          scope,
          done: () => `archive uploaded (${bytes(stats.bytes)})`,
        }),
      ),
    ),
  );

/** createLambda / updateLambda with the spec, flags and files. */
const saveLambda = (
  cmd: CreateOrUpdateLambdaArguments,
  type: 'createLambda' | 'updateLambda',
  payload: LambdaSpec,
  scope: string,
): Observable<SavedLambda> =>
  forkJoin({
    clusterId: resolveClusterId(payload.projectId, {
      clusterId: cmd.clusterId || payload.clusterId,
      clusterName: cmd.clusterName || payload.clusterName,
    }),
    code: cmd.code ? of(cmd.code) : ReadFile(cmd.file || payload.file),
    script: ReadFile(cmd.script || payload.script),
    packageJson: ReadFile(cmd.package || payload.package),
  }).pipe(
    switchMap(({ clusterId, ...files }) =>
      GraphqlClienAPI[type](
        lambdaPayload(cmd, payload, clusterId, files) as never,
      ),
    ),
    map((lambda) => lambda as SavedLambda),
    step(type === 'createLambda' ? 'creating lambda' : 'saving lambda', {
      scope,
      done: () => (type === 'createLambda' ? 'lambda created' : 'lambda saved'),
    }),
  );

const DEPLOY_POLL_MS = 3_000;
const DEPLOY_TIMEOUT_MS = 15 * 60_000;

const deployState = (lambda: SavedLambda) =>
  forkJoin({
    build: GraphqlClienAPI.getLambdaBuildStatus(lambda.id),
    // not on every API yet: an error = not known
    lambda: GraphqlClienAPI.getLambda(lambda.id, [
      'deployStatus' as never,
    ]).pipe(catchError(() => of(null))),
  }).pipe(
    map(({ build, lambda: l }) =>
      deployStateOf(build, (l as SavedLambda | null)?.deployStatus),
    ),
  );

/** A ready lambda can still carry broken output or fail to load its code. */
const reportBuildProblems = (lambdaId: string, scope: string) =>
  GraphqlClienAPI.getLambdaBuildStatus(lambdaId).pipe(
    tap((b) => {
      if (b?.buildErrors)
        ui.warn(`the build log has errors:\n${ui.dim(b.buildErrors)}`, scope);
      if (b?.runtimeErrors)
        ui.warn(
          `the running code reports errors:\n${ui.dim(b.runtimeErrors)}`,
          scope,
        );
    }),
    catchError(() => of(null)),
  );

/** Waits for the build + rollout (spinner with the build status), reports
    a failure with the log tail and stops the command with exit code 1. */
const followDeploy = (
  lambda: SavedLambda,
  type: 'createLambda' | 'updateLambda',
  scope: string,
  wait: boolean,
): Observable<SavedLambda> => {
  // every deploy is followed: the mutation's answer does not say whether a
  // build is running (deployStatus is not in its fields)
  if (!wait || !lambda?.id) return of(lambda);
  const started = Date.now();
  const spinner = ui.spin('building and rolling out', scope);
  const logsHint = `gcli lambda:logs-builder --name ${lambda.name}`;
  return timer(DEPLOY_POLL_MS, DEPLOY_POLL_MS).pipe(
    switchMap(() => deployState(lambda)),
    tap(({ status }) =>
      spinner.update(
        `building and rolling out${status ? ` (${status})` : ''} ${ui.dim(elapsed(Date.now() - started))}`,
      ),
    ),
    takeWhile(({ state }) => state === 'DEPLOYING', true),
    last(),
    timeout({ first: DEPLOY_TIMEOUT_MS }),
    finalize(() => spinner.stop()),
    switchMap(({ state }) => {
      const took = ui.dim(elapsed(Date.now() - started));
      if (state === 'LIVE') {
        ui.success(`built and live ${took}`, scope);
        return reportBuildProblems(lambda.id, scope).pipe(map(() => lambda));
      }
      ui.error(`the deploy failed ${took}`, scope);
      return GraphqlClienAPI.getLambdaBuildStatus(lambda.id).pipe(
        catchError(() => of(null)),
        tap((b) => {
          if (b?.logsTail) ui.print(ui.dim(b.logsTail.replace(/^/gm, '   │ ')));
          ui.print(`\n   Full build log: ${ui.bold(logsHint)}`);
        }),
        switchMap(() =>
          throwError(
            () => new ReportedError(`deploy of ${lambda.name} failed`),
          ),
        ),
      );
    }),
    catchError((e) => {
      if (e instanceof ReportedError) return throwError(() => e);
      const why =
        e?.name === 'TimeoutError'
          ? `still building after ${elapsed(DEPLOY_TIMEOUT_MS)}`
          : `could not follow the build (${errorText(e)})`;
      ui.warn(`${why} - follow it with ${logsHint}`, scope);
      return of(lambda);
    }),
  );
};

export const createOrUpdateLambda = (
  cmd: CreateOrUpdateLambdaArguments,
  type: 'createLambda' | 'updateLambda',
) => {
  if (cmd.json) humanOutputToStderr();
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        forkJoin({
          project: GraphqlClienAPI.getProject(projectId),
          spec: loadSpec(cmd.spec),
        }).pipe(map((r) => ({ projectId, ...r }))),
      ),
      switchMap(({ projectId, project, spec }) => {
        const data: LambdaSpec = { projectId, ...(spec?.function ?? spec) };
        const name = cmd.name || data.name || '';
        const scope = `lambda[${name}]`;
        // `triggers.time` and `domains:` live beside `function`; applied after the save
        const timeTrigger: DesiredTimeTrigger | undefined =
          spec?.triggers?.time;
        const domains: DomainConfig[] = spec?.domains ?? [];
        if (!cmd.embedded) {
          ui.header(
            `${type === 'createLambda' ? 'Creating' : 'Deploying'} ${name} to project ${project?.name || projectId}`,
          );
        }
        const prepared$: Observable<LambdaSpec> = data.uploadAsZip
          ? uploadArchive(cmd, data, scope)
          : of({ ...data, customUploadFileId: '' });
        return prepared$.pipe(
          switchMap((payload) => saveLambda(cmd, type, payload, scope)),
          switchMap((lambda) =>
            followDeploy(lambda, type, scope, cmd.wait !== false),
          ),
          // apply `triggers.time` of lambforge.yaml (it used to be ignored)
          switchMap((lambda) =>
            syncTimeTrigger(projectId, lambda, timeTrigger).pipe(
              map(() => lambda),
            ),
          ),
          // apply `domains:` - reported, never fails the deploy itself
          switchMap((lambda) =>
            applyDomains(projectId, domains, lambda?.name).pipe(
              catchError((e) => {
                ui.warn(
                  `not applied: ${errorText(e)} - run gcli domain:apply`,
                  'domains',
                );
                return of([]);
              }),
              map(() => lambda),
            ),
          ),
          switchMap((lambda) => finish(lambda, type, cmd)),
        );
      }),
    ),
  );
};

/** `✔ Deploy complete!` + the addresses; `--json` prints the lambda. */
const finish = (
  lambda: SavedLambda,
  type: 'createLambda' | 'updateLambda',
  cmd: CreateOrUpdateLambdaArguments,
) =>
  siteUrlOf(lambda).pipe(
    tap((siteUrl) => {
      if (cmd.embedded) {
        ui.success(
          `live at ${siteUrl || lambda?.url || '-'}`,
          `lambda[${lambda?.name}]`,
        );
        return;
      }
      ui.done(type === 'createLambda' ? 'Lambda created!' : 'Deploy complete!');
      ui.print('');
      ui.summary([
        ['URL', lambda?.url],
        ['Site', siteUrl],
        ['Logs', ui.dim(`gcli lambda:logs --name ${lambda?.name}`)],
      ]);
      if (cmd.json)
        process.stdout.write(`${JSON.stringify(lambda, null, 2)}\n`);
    }),
    map(() => lambda),
  );

/** The host-root site url (https://<projectId>-<route>.lambforge.com - what
    an SPA needs) of a public lambda on the shared cluster. Asked separately
    and best-effort, so an API without `siteUrl` still works. */
const siteUrlOf = (lambda: SavedLambda): Observable<string | null> =>
  lambda?.id
    ? GraphqlClienAPI.getLambda(lambda.id, ['siteUrl' as never]).pipe(
        map((l) => (l as { siteUrl?: string | null }).siteUrl ?? null),
        catchError(() => of(null)),
      )
    : of(null);

export const createCommand =
  (command: string) => (options: [string, string][]) => (program: Command) => {
    const cmd = program.command(command);

    for (const option of options) {
      cmd.option(...option);
    }
    return cmd as Command;
  };
