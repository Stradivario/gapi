import { esbuildDecorators } from '@anatine/esbuild-decorators';
import { Platform } from 'esbuild';

import { Logger } from '~/services/log';

export interface BuildArguments {
  files: string[];
  bundle: boolean;
  minify: boolean;
  platform: Platform;
  target: string;
  outfile: string;
  external: string[];
}

export default async (args: BuildArguments) => {
  Logger.info(
    `🔨 Bundling ${args.files?.length ? args.files.join('') : 'index.ts'}`,
  );
  const time = Date.now();
  return (await import('esbuild'))
    .build({
      entryPoints: args.files?.length ? args.files : ['index.ts'],
      bundle: args.bundle ?? true,
      minify: args.minify ?? false,
      platform: args.platform ?? 'node',
      target: args.target ?? 'node14.4',
      outfile: args.outfile ?? 'index.js',
      external: args.external ?? [],
      plugins: [
        esbuildDecorators({
          tsconfig: 'tsconfig.json',
          cwd: process.cwd(),
        }),
      ],
    })
    .then((data) => {
      if (data.warnings.length) {
        Logger.warn(data.warnings);
      }
      if (data.errors.length) {
        Logger.error(data.errors);
      }
      Logger.warn(`🏗️  Bundling finish in ${Date.now() - time}ms`);
      Logger.info(
        `✅ Finished bundling output file ${args.outfile ?? 'index.js'}`,
      );
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
};
