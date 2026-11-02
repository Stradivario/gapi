import { Command } from 'commander';

import { lazy } from '~/helpers';

export function buildCommands(program: Command) {
  program
    .command('build')
    .description('Build bundle using esbuild https://esbuild.github.io ')
    // No defaults on files/bundle/minify/target/outfile: unset flags fall
    // back to lambforge.yaml (function.file, options.bundler.*), then to
    // index.ts / bundle / node24 / index.js in build.ts. Commander defaults
    // (target node14.4) used to win over the yaml every time.
    .option(
      '-f, --files <files...>',
      'File or files to bundle (default: function.file from lambforge.yaml, else index.ts)',
    )
    .option(
      '-b, --bundle',
      'Bundle code (default: options.bundler.bundle, else true)',
    )
    .option(
      '-m, --minify',
      'Minify code (default: options.bundler.minify, else false)',
    )
    .option('-p, --platform <char>', 'Platform ', 'node')
    .option(
      '-t, --target <char>',
      'Target (default: options.bundler.target, else node24)',
    )
    .option(
      '-o, --outfile <char>',
      'Outfile name (default: options.bundler.outfile, else index.js)',
    )
    .option('-e, --external <external...>', 'External libraries')
    .action(lazy(() => import('./build').then((m) => m.default)));
}
