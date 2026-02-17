import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerCronTriggerCommands(program: Command) {
  program
    .command('cron:create')
    .description('Create cron')
    .option('-p, --project <project>')
    .option('-l, --lambdaName <lambdaName>')
    .option('-t, --triggerName <triggerName>')
    .option('-c, --cron <cron>')
    .action(lazy(() => import('./create-cron').then((m) => m.default)));

  program
    .command('cron:delete')
    .description('Delete cron')
    .option('-p, --project <project>')
    .option('-l, --lambdaName <lambdaName>')
    .action(lazy(() => import('./delete-cron').then((m) => m.default)));

  program
    .command('cron:list')
    .description('List of all cron jobs for project')
    .option('-p, --project <project>')
    .action(lazy(() => import('./list-crons').then((m) => m.default)));
}
