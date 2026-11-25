import { esbuildDecorators } from '@anatine/esbuild-decorators';
import { BuildOptions, Message, Platform } from 'esbuild';
import esbuild from 'esbuild';
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { defer, lastValueFrom, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { bytes, errorText, step, ui } from '~/services/ui';

import { loadSpec } from '../lambda/helpers/load-spec';
import { isolatedPlugin } from './isolated';

export interface BuildArguments {
  files: string[];
  bundle: boolean;
  minify: boolean;
  platform: Platform;
  target: string;
  outfile: string;
  external: string[];
  ignore?: string[];
}

/** `src/main.ts:12 Could not resolve "x"` */
const esbuildMessage = (m: Message) =>
  `${m.location ? `${m.location.file}:${m.location.line} ` : ''}${m.text}`;

const sizeOf = (file?: string) =>
  file && existsSync(file) ? ` (${bytes(statSync(file).size)})` : '';

export default async (args: BuildArguments) => {
  return lastValueFrom(
    loadSpec().pipe(
      switchMap((config) =>
        of(config).pipe(
          map((config) => ({
            esbuild,
            options: {
              entryPoints: args.files?.length
                ? args.files
                : [config?.function?.file ?? config?.file ?? 'index.ts'],
              bundle: args.bundle ?? config?.options?.bundler?.bundle ?? true,
              minify: args.minify ?? config?.options?.bundler?.minify ?? false,
              platform: args.platform ?? 'node',
              target:
                args.target ?? config?.options?.bundler?.target ?? 'node24',
              outfile:
                args.outfile ?? config?.options?.bundler?.outfile ?? 'index.js',
              external:
                args.external ?? config?.options?.bundler?.external ?? [],
            } as BuildOptions,
          })),
          switchMap(({ esbuild, options }) => {
            const entry = (options.entryPoints as string[]).join(', ');
            return defer(() =>
              esbuild.build({
                ...options,
                // Decorator metadata needs the project's tsconfig; without one
                // the plugin failed with "[plugin: tsc] failed to open
                // 'undefined'" - plain esbuild handles a project without it.
                plugins: [
                  // only this package's own node_modules (a service with
                  // its own lock file inside a monorepo)
                  ...(config?.options?.bundler?.isolated
                    ? [isolatedPlugin(process.cwd())]
                    : []),
                  ...(existsSync(join(process.cwd(), 'tsconfig.json'))
                    ? [
                        esbuildDecorators({
                          tsconfig: './tsconfig.json',
                          cwd: process.cwd(),
                        }),
                      ]
                    : []),
                ],
              }),
            ).pipe(
              tap((data) => {
                data.warnings.forEach((w) =>
                  ui.warn(esbuildMessage(w), 'build'),
                );
                data.errors.forEach((e) =>
                  ui.error(esbuildMessage(e), 'build'),
                );
              }),
              step(`bundling ${entry}`, {
                scope: 'build',
                done: () =>
                  `bundled ${entry} -> ${options.outfile}${sizeOf(options.outfile)}`,
              }),
            );
          }),
        ),
      ),
    ),
  ).catch((e) => {
    // esbuild has printed the details already
    ui.error(errorText(e), 'build');
    process.exit(1);
  });
};
