import {
  IGraphqlFile,
  IHttpMethodsEnum,
  ILambdaScaleOptionsExecutorTypeEnum,
} from '@introspection/index';
import { Command } from 'commander';
import FormData from 'form-data';
import { createReadStream, ReadStream, WriteStream } from 'fs';
import fetch from 'node-fetch';
import { from, lastValueFrom, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import streamToBuffer from 'stream-to-buffer';

import { parseProjectId, resolveClusterId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import packageZip from '../package';
import { loadSpec } from './load-spec';
import { readFileAsObservable } from './read-file';

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

export const createOrUpdateLambda = (
  cmd: CreateOrUpdateLambdaArguments,
  type: 'createLambda' | 'updateLambda',
) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.getProject(projectId).pipe(map(() => projectId)),
      ),
      switchMap(async (projectId) => {
        const spec = await lastValueFrom(loadSpec(cmd.spec));
        return {
          projectId,
          ...(spec?.function ?? spec),
        };
      }),
      /* Make zip archive */
      /* Get file id */
      switchMap(async (data) => {
        if (!data.uploadAsZip) {
          return { ...data, customUploadFileId: '' };
        }

        await packageZip(cmd);

        const body = new FormData();
        body.append('file[]', createReadStream(`.gcache/${data.name}.zip`));
        const config = await lastValueFrom(GraphqlClienAPI.getConfig());

        return lastValueFrom(
          from(
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
          ).pipe(
            switchMap((res) => res.json() as Promise<IGraphqlFile>),
            map((file) => ({
              ...data,
              customUploadFileId: file.id,
            })),
          ),
        );
      }),
      switchMap(async (payload) => {
        const clusterId = await lastValueFrom(
          resolveClusterId(payload.projectId, {
            clusterId: cmd.clusterId || payload.clusterId,
            clusterName: cmd.clusterName || payload.clusterName,
          }),
        );
        return lastValueFrom(
          GraphqlClienAPI[type]({
            code:
              cmd.code ||
              (await lastValueFrom(ReadFile(cmd.file || payload.file))) ||
              '',
            name: cmd.name || payload.name || '',
            projectId: payload.projectId,
            route: cmd.route || payload.route || '',
            buildBashScript:
              cmd.buildBashScript ||
              (await lastValueFrom(ReadFile(cmd.script || payload.script))) ||
              '',
            configs: cmd.configs || payload.configs || [],
            env: cmd.env || payload.env || 'nodejs',
            method: cmd.method || payload.method || ['GET'],
            packageJson:
              cmd.packageJson ||
              (await lastValueFrom(ReadFile(cmd.package || payload.package))) ||
              '{}',
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
                cmd.executorType ||
                payload.scaleOptions?.executorType ||
                'poolmgr',
              maxCpu: cmd.maxCpu || payload.scaleOptions?.maxCpu || 0,
              maxMemory: cmd.maxMemory || payload.scaleOptions?.maxMemory || 0,
              maxScale: cmd.maxScale || payload.scaleOptions?.maxScale || 0,
              minCpu: cmd.minCpu || payload.scaleOptions?.minCpu || 0,
              minMemory: cmd.minMemory || payload.scaleOptions?.minMemory || 0,
              minScale: cmd.minScale || payload.scaleOptions?.minScale || 0,
              targetCpu: cmd.targetCpu || payload.scaleOptions?.targetCpu || 0,
              idleTimeout:
                cmd.idleTimeout || payload.scaleOptions?.idleTimeout || 120,
              // 0 = not set: the server fills these in within the project's
              // plan (concurrency <= 3, timeouts 60/120 s capped). A fixed
              // 500 / 60 / 120 here was refused on plans with lower maxima.
              concurrency:
                cmd.concurrency || payload.scaleOptions?.concurrency || 0,
              functionTimeout:
                cmd.functionTimeout ||
                payload.scaleOptions?.functionTimeout ||
                0,
              specializationTimeout:
                cmd.specializationTimeout ||
                payload.scaleOptions?.specializationTimeout ||
                0,
            },
          }),
        );
      }),
      tap((data) => {
        Logger.info(JSON.stringify(data, null, 2));
      }),
      switchMap((data) => printAddresses(data)),
    ),
  );

/** The two addresses to hand the user: the router url and, for a public
    lambda on the shared cluster, the host-root site url
    (https://<projectId>-<route>.lambforge.com - what an SPA needs). Asked
    separately and best-effort, so an API without `siteUrl` still works. */
const printAddresses = <T extends { id?: string | null; url?: string | null }>(
  data: T,
): Observable<T> =>
  (data?.id
    ? GraphqlClienAPI.getLambda(data.id, ['siteUrl' as never]).pipe(
        map((l) => (l as { siteUrl?: string | null }).siteUrl ?? null),
        catchError(() => of(null)),
      )
    : of(null)
  ).pipe(
    tap((siteUrl) => {
      if (data?.url) Logger.info(`URL:  ${data.url}`);
      if (siteUrl) Logger.info(`Site: ${siteUrl}`);
    }),
    map(() => data),
  );

export const createCommand =
  (command: string) => (options: [string, string][]) => (program: Command) => {
    const cmd = program.command(command);

    for (const option of options) {
      cmd.option(...option);
    }
    return cmd as Command;
  };
