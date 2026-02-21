import { Command } from 'commander';

import { lazy } from '~/helpers';

export function startCommands(program: Command) {
  program
    .command('start')
    .description('Start bundle using esbuild https://esbuild.github.io ')
    .option(
      '-f, --files <files...>',
      'File or files to bundle defaults to index.ts',
    )
    .option('-b, --bundle', 'Bundle code', true)
    .option('-m, --minify', 'Minify code', false)
    .option('-p, --platform <char>', 'Platform ', 'node')
    .option('-t, --target <char>', 'Target ', 'node14.4')
    .option('-o, --outfile <char>', 'Outfile name')
    .option(
      '-i, --ignore <ignore...>',
      'Ignore folders from triggering restarts',
    )
    .option('-e, --external <external...>', 'External libraries')
    .action(lazy(() => import('./start').then((m) => m.default)));
}
