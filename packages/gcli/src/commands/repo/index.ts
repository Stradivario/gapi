import { Command } from 'commander';

import { lazy } from '~/helpers';

/** Repository-wide commands (graphql-server plan 46): every lambforge.yaml of
    a repository - a monorepo of lambdas or a single one at the root. */
export function registerRepoCommands(program: Command) {
  program
    .command('validate [path]')
    .description(
      'Check every lambforge.yaml of the repository (unknown keys, wrong types, clashing names); --online also against the live platform API',
    )
    .option('--online', 'Compare function / environment keys with the live API')
    .action(lazy(() => import('./validate').then((m) => m.default)));

  program
    .command('plan [path]')
    .description(
      'Compare every lambforge.yaml of the repository with what runs in the project: in sync, will change, missing, unmanaged',
    )
    .option('-p, --project <project>')
    .option(
      '--exit-code',
      'Exit 2 when something would change, 1 on errors (for CI)',
    )
    .option('--json', 'Machine-readable output')
    .action(lazy(() => import('./plan').then((m) => m.default)));

  program
    .command('apply [path]')
    .description(
      'Make every lambforge.yaml of the repository true: shows the plan, asks, then creates / updates environments, lambdas (waiting for each build), time + queue triggers and domains. Never deletes.',
    )
    .option('-p, --project <project>')
    .option('-y, --yes', 'Apply without asking (CI)')
    .option(
      '--code',
      'Also redeploy lambdas whose settings are in sync (code changes are not detected yet)',
    )
    .option(
      '--only <lambda>',
      'Only the lambforge.yaml of this lambda (or folder)',
    )
    .action(lazy(() => import('./apply').then((m) => m.default)));

  program
    .command('export <lambda>')
    .description(
      'Generate a lambforge.yaml from a running lambda (function, environment, time trigger, domains) - secret and config names only',
    )
    .option('-p, --project <project>')
    .option('-o, --output <file>', 'Write to a file instead of stdout')
    .action(lazy(() => import('./export').then((m) => m.default)));
}
