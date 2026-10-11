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
