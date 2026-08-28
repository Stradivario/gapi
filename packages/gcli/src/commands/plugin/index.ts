import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerPluginCommands(program: Command) {
  program
    .command('plugin:list')
    .description('List every plugin available in the marketplace catalog')
    .action(lazy(() => import('./list').then((m) => m.default)));

  program
    .command('plugin:installed')
    .description(
      'List plugins installed for a project (may include the same plugin on several clusters)',
    )
    .option('-p, --project <project>')
    .action(lazy(() => import('./installed').then((m) => m.default)));

  program
    .command('plugin:install')
    .description('Install a marketplace plugin for a project')
    .option('-p, --project <project>')
    .option('-spec, --spec <spec>')
    .option('-n, --name <name>', 'Plugin name, e.g. redis-plugin')
    .option(
      '-c, --cluster <cluster>',
      'Which private cluster to install into; omit for the shared cluster',
    )
    .action(lazy(() => import('./install').then((m) => m.default)));

  program
    .command('plugin:uninstall')
    .description(
      "Uninstall a plugin from a project (--cluster picks which installation, if it's on several)",
    )
    .option('-p, --project <project>')
    .option('-n, --name <name>', 'Plugin name')
    .option('-c, --cluster <cluster>')
    .action(lazy(() => import('./uninstall').then((m) => m.default)));
}
