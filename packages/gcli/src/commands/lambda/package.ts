import archiver from 'archiver';
import { exec } from 'child_process';
import { mkdir, writeFile } from 'fs';
import { from, lastValueFrom, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { promisify } from 'util';

import {
  CreateOrUpdateLambdaArguments,
  streamToBufferPromise,
} from './helpers';
import { loadSpec } from './helpers/load-spec';
import { parseIgnoredFiles } from './helpers/parse-ignore';
import { readFileAsObservable } from './helpers/read-file';

const ReadFile = (file: string): Observable<string> =>
  readFileAsObservable(file).pipe(catchError(() => of('')));

export default (cmd: CreateOrUpdateLambdaArguments) => {
  return lastValueFrom(
    loadSpec(cmd.spec).pipe(
      map((spec) => spec?.function ?? spec),
      switchMap(async (data) => {
        const archive = archiver('zip', {
          zlib: { level: 9 }, // Sets the compression level.
        });
        await promisify(exec)(['chmod', '+x', data.script].join(' '));
        const ignore = await lastValueFrom(
          ReadFile('.gignore').pipe(
            map((ignore) => parseIgnoredFiles(ignore) as string[]),
          ),
        );

        archive.glob('**', {
          ignore: ['.gcache/**', ...ignore],
        });

        archive.finalize();

        return lastValueFrom(
          from(streamToBufferPromise(archive)).pipe(
            switchMap((buffer) =>
              from(promisify(mkdir)('.gcache')).pipe(
                catchError(() => of(true)),
                switchMap(() =>
                  promisify(writeFile)(`.gcache/${data.name}.zip`, buffer),
                ),
              ),
            ),
          ),
        );
      }),
    ),
  );
};
