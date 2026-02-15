import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerMcpCommands(program: Command) {
  program
    .command('mcp:start')
    .description('Start mcp proxy server')
    .option('-u, --url <url>', 'Specify mcp api url')
    .action(lazy(() => import('./start').then((m) => m.default)));
}
