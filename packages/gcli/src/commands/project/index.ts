import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerProjectCommands(program: Command) {
  program
    .command('project:list')
    .description('List of all projects')
    .action(lazy(() => import('./list').then((m) => m.default)));

  program
    .command('project:use')
    .arguments('<project>')
    .description('Adds default project to be used all around the CLI')
    .action(lazy(() => import('./use').then((m) => m.default)));

  program
    .command('project:clear')
    .description('Clears default project to be used all around the CLI')
    .action(lazy(() => import('./clear').then((m) => m.default)));
}
