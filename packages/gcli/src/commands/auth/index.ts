import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerAuthCommands(program: Command) {
  program
    .command('login')
    .description('Login to graphql-server')
    .option('-k, --key <key>', 'Specify api key')
    .option('-uu, --uploadUrl <key>', 'Specify upload server')
    .option(
      '-i, --integration <key>',
      'Initialize directories for CI/CD purposes',
    )
    .option(
      '-t, --token <token>',
      'Specify custom token generated from the website',
    )
    .option('-u, --url <url>', 'Specify api url')
    .action(lazy(() => import('./login').then((m) => m.default)));
}
