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

import { parseProjectId } from '~/helpers';
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
  network: string[];
  env: string;
  method: IHttpMethodsEnum[];
  packageJson: string;
  package: string;
  params: string[];
  customUploadFileId: string;
  /* Federation gateway (from lambforge.yaml `function.federation` / `function.subgraphs`) */
  federation?: boolean;
  subgraphs?: string[];
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

            network: cmd.network || payload.network || ['public', 'private'],
            federation: cmd.federation ?? !!payload.federation,
            subgraphs: cmd.subgraphs || payload.subgraphs || [],
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
              concurrency:
                cmd.concurrency || payload.scaleOptions?.concurrency || 500,
              functionTimeout:
                cmd.functionTimeout ||
                payload.scaleOptions?.functionTimeout ||
                60,
              specializationTimeout:
                cmd.specializationTimeout ||
                payload.scaleOptions?.specializationTimeout ||
                120,
            },
          }),
        );
      }),
      tap((data) => {
        Logger.info(JSON.stringify(data, null, 2));
      }),
    ),
  );

export const createCommand =
  (command: string) => (options: [string, string][]) => (program: Command) => {
    const cmd = program.command(command);

    for (const option of options) {
      cmd.option(...option);
    }
    return cmd as Command;
  };
