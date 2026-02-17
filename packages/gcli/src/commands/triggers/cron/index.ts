import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerCronTriggerCommands(program: Command) {
  program
    .command('cron:create')
    .description('List of all environments for project')
    .option('-p, --project <project>')
    .action(lazy(() => import('./create-cron').then((m) => m.default)));
}
