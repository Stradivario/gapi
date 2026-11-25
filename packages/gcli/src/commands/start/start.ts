import { ChildProcess, spawn } from 'node:child_process';
import { watch } from 'node:fs';

import { from, fromEvent, lastValueFrom, merge, of } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';

import { Logger } from '~/services/log';
import { ui } from '~/services/ui';

import build, { BuildArguments } from '../build/build';
import { loadSpec } from '../lambda/helpers/load-spec';

export default async function start(args: BuildArguments) {
  return lastValueFrom(
    loadSpec().pipe(
      switchMap((config) =>
        of({
          watcher: watch(process.cwd(), {
            recursive: true,
          }),
          whitelist: new Map(
            [
              ...(args?.files ?? []),
              ...(config.file ? [config.file] : []),
              ...(config?.options?.bundler?.watch ?? []),
            ].map((name) => [name, true]),
          ),
          ignorelist: new Map(
            [
              ...(args?.ignore ?? []),
              ...(config?.options?.bundler?.ignore ?? []),
            ].map((name) => [name, true]),
          ),
          child: null as ChildProcess,
          outfile:
            args.outfile ?? config?.options?.bundler?.outfile ?? 'index.js',
          startCommand: 'node',
        }).pipe(
          switchMap(
            ({
              child,
              watcher,
              whitelist,
              outfile,
              startCommand,
              ignorelist,
            }) =>
              from(build(args)).pipe(
                tap(() => {
                  ui.info(`running ${startCommand} ${outfile}\n`, 'start');
                }),
                tap(() => {
                  child = spawn(
                    startCommand,
                    ['--disable-warning=DEP0040', outfile],
                    {
                      stdio: 'inherit',
                      env: process.env,
                    },
                  );
                }),
                tap(() =>
                  merge(
                    fromEvent(process, 'SIGINT'),
                    fromEvent(process, 'SIGTERM'),
                    fromEvent(process, 'exit'),
                  )
                    .pipe(
                      debounceTime(100),
                      tap(() => {
                        Logger.warn('⚠️  Main process shutting down');
                        watcher.close();
                        child.kill('SIGTERM');
                        process.exit();
                      }),
                    )
                    .subscribe(),
                ),
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

                      for (const ignorePath of ignorelist.keys()) {
                        if (filename.startsWith(ignorePath)) {
                          return false;
                        }
                      }

                      const rootDir = filename.split(/[/\\]/)[0];

                      return whitelist.has(rootDir);
                    }),
                    debounceTime(100),
                  ),
                ),
                tap((data) => {
                  ui.print('');
                  ui.info(`${data.filename} changed - restarting`, 'start');
                  child?.kill('SIGTERM');
                }),
                switchMap(() => build(args)),
                tap(() => {
                  ui.info(`running ${startCommand} ${outfile}\n`, 'start');
                  child = spawn(
                    startCommand,
                    ['--disable-warning=DEP0040', outfile],
                    {
                      stdio: 'inherit',
                      env: process.env,
                    },
                  );
                }),
              ),
          ),
        ),
      ),
    ),
  );
}
