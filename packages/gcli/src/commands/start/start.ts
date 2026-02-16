import { ChildProcess, exec } from 'node:child_process';
import { watch } from 'node:fs';

import { from, fromEvent, lastValueFrom, of } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';

import { Logger } from '~/services/log';

import build, { BuildArguments } from '../build/build';
import { loadSpec } from '../lambda/helpers/load-spec';

export default async function start(args: BuildArguments) {
  Logger.log('---------------------------------');
  return lastValueFrom(
    loadSpec<{ options: { bundler: { watch: [] } } }>().pipe(
      switchMap((config) =>
        of({
          watcher: watch(process.cwd(), {
            recursive: true,
          }),
          whitelist: new Map(
            [
              ...(args?.files ?? []),
              ...(config?.options?.bundler?.watch ?? []),
              'index.ts',
            ].map((name) => [name, '']),
          ),
          child: null as ChildProcess,
        }).pipe(
          switchMap(({ child, watcher, whitelist }) =>
            from(build(args)).pipe(
              tap(() => {
                Logger.warn(
                  `📢 Starting script "node ${args.outfile ?? 'index.js'}"`,
                );
                Logger.log('---------------------------------\n');
              }),
              map(() => exec(`node ${args.outfile ?? 'index.js'}`)),
              tap((proc) => {
                child = proc;
                child.stdout.pipe(process.stdout);
              }),
              switchMap(() =>
                fromEvent(watcher, 'change').pipe(
                  map(([event, filename]: [string, string]) => ({
                    event,
                    filename,
                  })),
                  filter(({ filename }) => {
                    if (!filename) {
                      return false;
                    }

                    const rootDir = filename.split(/[/\\]/)[0];

                    return whitelist.has(rootDir);
                  }),
                  debounceTime(100),
                ),
              ),
              tap(async (data) => {
                Logger.log('\n---------------------------------');
                Logger.log(`⟳  Restarting due to change in: ${data.filename}`);
                child?.kill();
                await build(args);
                Logger.warn(
                  `📢 Starting script "node ${args.outfile ?? 'index.js'}"`,
                );
                Logger.log('---------------------------------\n');
                child = exec(`node ${args.outfile ?? 'index.js'}`);
                child.stdout.pipe(process.stdout);
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
