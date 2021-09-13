import {
  IGraphqlFile,
  IHttpMethodsEnum,
  ILambdaEnvironmentsEnum,
} from '@introspection/index';
import archiver from 'archiver';
import { exec } from 'child_process';
import { CommanderStatic } from 'commander';
import FormData from 'form-data';
import {
  createReadStream,
  mkdir,
  readFile,
  ReadStream,
  writeFile,
  WriteStream,
} from 'fs';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import streamToBuffer from 'stream-to-buffer';
import { promisify } from 'util';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';

import { loadSpec } from './load-spec';
import { parseIgnoredFiles } from './parse-ignore';

function ReadFile(file: string): Observable<string> {
  return from(promisify(readFile)(file, { encoding: 'utf-8' })).pipe(
    catchError(() => of('')),
  );
}

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
        const ignore = await from(
          promisify(readFile)('.gignore', {
            encoding: 'utf-8',
          }),
        )
          .pipe(
            catchError(() => of('')),
            map((ignore) => parseIgnoredFiles(ignore) as string[]),
          )
          .toPromise();

        archive.glob('**', {
          ignore: ['.gcache/**', ...ignore],
        });

        archive.finalize();

        const body = new FormData();
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

        body.append('file[]', createReadStream(`.gcache/${data.name}.zip`));
        const config = await GraphqlClienAPI.getConfig().toPromise();

        return from(
          fetch('https://pubsub.graphql-server.com/upload-lambda', {
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
        }).toPromise(),
      ),
      tap((data) => {
        console.dir(data, { depth: null, colors: true });
      }),
    )
    .toPromise();

export const createCommand = (command: string) => (
  options: [string, string][],
) => (program: CommanderStatic) => {
  const cmd = program.command(command);

  for (const option of options) {
    cmd.option(...option);
  }
  return cmd as CommanderStatic;
};
