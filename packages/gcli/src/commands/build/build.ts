import { esbuildDecorators } from '@anatine/esbuild-decorators';
import { Platform } from 'esbuild';

export default async (args: {
  entryPoints: string[];
  bundle: boolean;
  minify: boolean;
  platform: Platform;
  target: string;
  outfile: string;
  external: string[];
}) => {
  return (await import('esbuild'))
    .build({
      entryPoints: args.entryPoints?.length ? args.entryPoints : ['index.ts'],
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
    .then((r) => console.log('SUCCESS', r))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
};
