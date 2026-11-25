import archiver from 'archiver';
import { exec } from 'child_process';
import { mkdir, writeFile } from 'fs';
import { defer, forkJoin, lastValueFrom, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { promisify } from 'util';

import {
  CreateOrUpdateLambdaArguments,
  streamToBufferPromise,
} from './helpers';
import { archiveGlobs } from './helpers/archive-globs';
import { loadSpec } from './helpers/load-spec';
import { parseIgnoredFiles } from './helpers/parse-ignore';
import { readFileAsObservable } from './helpers/read-file';

export interface PackageStats {
  /** .gcache/<name>.zip */
  path: string;
  files: number;
  bytes: number;
}

const ReadFile = (file: string): Observable<string> =>
  readFileAsObservable(file).pipe(catchError(() => of('')));

/** Zips the package (minus .gignore and the built-in ignores) into
    .gcache/<name>.zip and says how many files and bytes went in. */
export const packageArchive = (
  cmd: CreateOrUpdateLambdaArguments,
): Observable<PackageStats> =>
  loadSpec(cmd.spec).pipe(
    map((spec) => spec?.function ?? spec),
    switchMap((data) =>
      forkJoin([
        defer(() => promisify(exec)(['chmod', '+x', data.script].join(' '))),
        ReadFile('.gignore').pipe(
          map((ignore) => parseIgnoredFiles(ignore) as string[]),
        ),
      ]).pipe(
        switchMap(([, ignore]) => {
          const archive = archiver('zip', { zlib: { level: 9 } });
          let files = 0;
          archive.on('entry', (entry) => {
            if (entry.type === 'file') files++;
          });
          archiveGlobs(ignore).forEach(({ pattern, options }) =>
            archive.glob(pattern, options),
          );
          archive.finalize();
          const path = `.gcache/${data.name}.zip`;
          return defer(() => streamToBufferPromise(archive)).pipe(
            switchMap((buffer) =>
              defer(() => promisify(mkdir)('.gcache')).pipe(
                catchError(() => of(true)),
                switchMap(() => promisify(writeFile)(path, buffer)),
                map(() => ({ path, files, bytes: buffer.length })),
              ),
            ),
          );
        }),
      ),
    ),
  );

export default (cmd: CreateOrUpdateLambdaArguments) =>
  lastValueFrom(packageArchive(cmd));
