import { Command } from 'commander';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { lazy } from '~/helpers';

export function buildCommands(program: Command) {
  program
    .command('build')
    .description('Build bundle using esbuild https://esbuild.github.io ')
    .option(
      '-f, --files <files...>',
      'File or files to bundle defaults to index.ts',
    )
    .option('-b, --bundle', 'Bundle code', true)
    .option('-m, --minify', 'Minify code', false)
    .option('-p, --platform <char>', 'Platform ', 'node')
    .option('-t, --target <char>', 'Target ', 'node14.4')
    .option('-o, --outfile <char>', 'Outfile name')
    .option('-e, --external <external...>', 'External libraries')
    .action(
      lazy(() =>
        from(import('./build'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );
}
