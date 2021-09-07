import { CommanderStatic } from 'commander';

import { lazy } from '~/helpers';

export function registerAuthCommands(program: CommanderStatic) {
  program
    .command('login')
    .description('Login to graphql-server')
    .option('--key, -k', 'Specify api key')
    .option('--token, -t', 'Specify custom token generated from the website')
    .option('--url, -u', 'Specify api url')
    .action(lazy(() => import('./login').then((m) => m.default)));

  program
    .command('use')
    .description('Adds default project to be used all around the CLI')
    .option('--project, -p', 'Specify project id')
    .action(lazy(() => import('./use').then((m) => m.default)));

  program
    .command('clear')
    .description('Clears default project to be used all around the CLI')
    .action(lazy(() => import('./clear').then((m) => m.default)));
}
