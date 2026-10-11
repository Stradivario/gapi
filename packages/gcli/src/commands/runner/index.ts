import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerRunnerCommands(program: Command) {
  program
    .command('runner:start')
    .description(
      "Connect this machine's Ollama to the Lambforge chat as a local AI runner (outbound connection only - works behind NAT, Ollama is never exposed)",
    )
    .option(
      '-n, --name <name>',
      'Runner name shown in the chat model picker (default: hostname)',
    )
    .option(
      '-t, --token <token>',
      'Runner token from Profile -> Local AI runners (instead of `gcli login`)',
    )
    .option(
      '--ollama <url>',
      'Ollama URL (default: $OLLAMA_HOST or http://127.0.0.1:11434)',
    )
    .option('--wsUrl <url>', 'Lambforge subscriptions endpoint override')
    .option('--reset', 'Forget the saved runner and register a new one')
    .action(lazy(() => import('./start').then((m) => m.default)));

  program
    .command('runner:daemon:install')
    .alias('runner:start:daemon')
    .description(
      'Run the runner in the background as a systemd user service: starts with your session, restarts on failure (Linux)',
    )
    .option(
      '-n, --name <name>',
      'Runner name when registering (default: hostname)',
    )
    .option(
      '-t, --token <token>',
      'Runner token for a machine without `gcli login`',
    )
    .option(
      '--ollama <url>',
      'Ollama URL (default: $OLLAMA_HOST or http://127.0.0.1:11434)',
    )
    .option('--wsUrl <url>', 'Lambforge subscriptions endpoint override')
    .option('--reset', 'Forget the saved runner and register a new one')
    .option('--service <name>', 'systemd unit name (default: lambforge-runner)')
    .option('--dry-run', 'Print the unit file instead of installing it')
    .action(lazy(() => import('./daemon-commands').then((m) => m.install)));

  program
    .command('runner:daemon:status')
    .description('Show the runner service status (systemctl --user status)')
    .option('--service <name>', 'systemd unit name (default: lambforge-runner)')
    .action(lazy(() => import('./daemon-commands').then((m) => m.status)));

  program
    .command('runner:daemon:logs')
    .description('Follow the runner service log (journalctl --user -f)')
    .option('--service <name>', 'systemd unit name (default: lambforge-runner)')
    .option('--lines <n>', 'Lines of history to show first (default 50)')
    .action(lazy(() => import('./daemon-commands').then((m) => m.logs)));

  program
    .command('runner:daemon:uninstall')
    .description(
      'Stop and remove the runner service (the runner stays registered)',
    )
    .option('--service <name>', 'systemd unit name (default: lambforge-runner)')
    .action(lazy(() => import('./daemon-commands').then((m) => m.uninstall)));

  program
    .command('runner:list')
    .description('List your local AI runners and the models they serve')
    .action(lazy(() => import('./list').then((m) => m.default)));

  program
    .command('runner:models')
    .description(
      "Choose which of a runner's models appear in the chat model picker (no flags: list them)",
    )
    .option(
      '--id <id>',
      'Runner id (default: the runner saved on this machine)',
    )
    .option(
      '--show <models>',
      'Comma-separated models to show (hides the rest)',
    )
    .option('--all', 'Show every model again')
    .option('--none', 'Hide all models of this runner from the chat')
    .action(lazy(() => import('./models').then((m) => m.default)));

  program
    .command('runner:delete')
    .description('Delete a local AI runner and revoke its token')
    .option(
      '--id <id>',
      'Runner id (default: the runner saved on this machine)',
    )
    .action(lazy(() => import('./delete').then((m) => m.default)));
}
