import { esbuildDecorators } from '@anatine/esbuild-decorators';
import { BuildOptions, Platform } from 'esbuild';
import esbuild from 'esbuild';
import { lastValueFrom, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { Logger } from '~/services/log';

import { loadSpec } from '../lambda/helpers/load-spec';

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

export default async (args: BuildArguments) => {
  const time = Date.now();
  return lastValueFrom(
    loadSpec().pipe(
      tap((config) => {
        Logger.info(
          `🔨 Bundling ${args.files?.length ? args.files.join('') : (config?.function?.file ?? config?.file ?? 'index.ts')}`,
        );
      }),
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
          switchMap(({ esbuild, options }) =>
            esbuild.build({
              ...options,
              plugins: [
                esbuildDecorators({
                  tsconfig: './tsconfig.json',
                  cwd: process.cwd(),
                }),
              ],
            }),
          ),
          tap((data) => {
            if (data.warnings.length) {
              Logger.warn(data.warnings);
            }
            if (data.errors.length) {
              Logger.error(data.errors);
            }
            Logger.warn(`🏗️  Bundling finish in ${Date.now() - time}ms`);
            Logger.info(
              `✅ Finished bundling output file ${args.outfile ?? config?.options?.bundler?.outfile ?? 'index.js'}`,
            );
          }),
        ),
      ),
    ),
  ).catch((e) => {
    console.error(e);
    process.exit(1);
  });
};
