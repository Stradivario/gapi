import {
  IGraphqlFile,
  IHttpMethodsEnum,
  ILambdaEnvironmentsEnum,
  ILambdaScaleOptionsExecutorTypeEnum,
} from '@introspection/index';
import * as archiver from 'archiver';
import { exec } from 'child_process';
import { Command } from 'commander';
import * as FormData from 'form-data';
import {
  createReadStream,
  mkdir,
  ReadStream,
  writeFile,
  WriteStream,
} from 'fs';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as streamToBuffer from 'stream-to-buffer';
import { promisify } from 'util';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';

import { loadSpec } from './load-spec';
import { parseIgnoredFiles } from './parse-ignore';
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
  config: string;
  secret: string;
  env: ILambdaEnvironmentsEnum;
  method: IHttpMethodsEnum;
  packageJson: string;
  package: string;
  params: string[];
  customUploadFileId: string;
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
function streamToBufferPromise(file: File | ReadStream | WriteStream) {
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
  parseProjectId(cmd.project)
    .pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.getProject(projectId).pipe(map(() => projectId)),
      ),
      switchMap(async (projectId) => ({
        projectId,
        ...(await loadSpec(cmd.spec).toPromise()),
      })),
      /* Make zip archive */
      /* Get file id */
      switchMap(async (data) => {
        if (!data.uploadAsZip) {
          return { ...data, customUploadFileId: '' };
        }
        const archive = archiver('zip', {
          zlib: { level: 9 }, // Sets the compression level.
        });
        await promisify(exec)(['chmod', '+x', data.script].join(' '));
        const ignore = await ReadFile('.gignore')
          .pipe(map((ignore) => parseIgnoredFiles(ignore) as string[]))
          .toPromise();

        archive.glob('**', {
          ignore: ['.gcache/**', ...ignore],
        });

        archive.finalize();

        await from(streamToBufferPromise(archive))
          .pipe(
            switchMap((buffer) =>
              from(promisify(mkdir)('.gcache')).pipe(
                catchError(() => of(true)),
                switchMap(() =>
                  promisify(writeFile)(`.gcache/${data.name}.zip`, buffer, {
                    encoding: 'utf-8',
                  }),
                ),
              ),
            ),
          )
          .toPromise();
        const body = new FormData();
        body.append('file[]', createReadStream(`.gcache/${data.name}.zip`));
        const config = await GraphqlClienAPI.getConfig().toPromise();

        return from(
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
        )
          .pipe(
            switchMap((res) => res.json() as Promise<IGraphqlFile>),
            tap((res) => console.log(res)),
            map((file) => ({
              ...data,
              customUploadFileId: file.id,
            })),
          )
          .toPromise();
      }),
      switchMap(async (payload) =>
        GraphqlClienAPI[type]({
          code:
            cmd.code ||
            (await ReadFile(payload.file || cmd.file).toPromise()) ||
            '',
          name: payload.name || (cmd.name as never) || '',
          projectId: payload.projectId,
          route: cmd.route || payload.route || '',
          buildBashScript:
            cmd.buildBashScript ||
            (await ReadFile(payload.script || cmd.script).toPromise()) ||
            '',
          config: payload.config || cmd.config || '',
          env: cmd.env || payload.env || 'NODEJS',
          method: cmd.method || payload.method || 'GET',
          packageJson:
            cmd.packageJson ||
            (await ReadFile(payload.package || cmd.package).toPromise()) ||
            '{}',
          params: cmd.params || payload.params || [],
          secret: cmd.secret || payload.secret || '',
          customUploadFileId:
            cmd.customUploadFileId || payload.customUploadFileId || '',
          scaleOptions: {
            executorType:
              cmd.executorType ||
              payload.scaleOptions?.executorType ||
              'POOLMGR',
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
        }).toPromise(),
      ),
      tap((data) => {
        console.dir(data, { depth: null, colors: true });
      }),
    )
    .toPromise();

export const createCommand = (command: string) => (
  options: [string, string][],
) => (program: Command) => {
  const cmd = program.command(command);

  for (const option of options) {
    cmd.option(...option);
  }
  return cmd as Command;
};
