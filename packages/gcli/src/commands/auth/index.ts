import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerAuthCommands(program: Command) {
  program
    .command('login')
    .description(
      'Log in. Without --token: prints a link, opens your browser and waits for you to approve it on lambforge.com',
    )
    .option('--no-browser', 'Only print the login link, do not open a browser')
    .option('-k, --key <key>', 'Specify api key')
    .option('-uu, --uploadUrl <key>', 'Specify upload server')
    .option('-ci, --ci', 'Initialize directories for CI/CD purposes')
    .option(
      '-t, --token <token>',
      'Specify custom token generated from the website',
    )
    .option('-u, --url <url>', 'Specify api url')
    .action(lazy(() => import('./login').then((m) => m.default)));
}
