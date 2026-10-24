import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerWorkspaceCommands(program: Command) {
  program
    .command('workspace:start')
    .description(
      'Connect the current directory to the Lambforge chat as a local workspace: the AI agents can read/edit its files and run commands here (outbound connection only - works behind NAT)',
    )
    .option(
      '-n, --name <name>',
      'Workspace name shown in the chat (default: directory name)',
    )
    .option(
      '-p, --project <projectId>',
      'Project the workspace belongs to (default: `gcli project:use`)',
    )
    .option(
      '-t, --token <token>',
      'Workspace token (instead of registering with `gcli login`)',
    )
    .option(
      '--allow <commands>',
      'Comma-separated commands that run without approval; * matches anything (e.g. "npm test,npm run *")',
    )
    .option(
      '--no-default-allow',
      'Do not pre-allow read-only commands (git status/diff/log, ls, ...)',
    )
    .option(
      '--yolo',
      'Run EVERY command without asking (only in a sandbox / a repo you can reset)',
    )
    .option(
      '--no-terminal-approval',
      'Approve commands only in the chat, never prompt in this terminal',
    )
    .option(
      '--env <names>',
      'Comma-separated environment variables to pass to commands (default: a minimal environment)',
    )
    .option('--inherit-env', 'Pass your whole shell environment to commands')
    .option(
      '--allow-secrets',
      'Let the chat read/write .env files, keys and other secrets files',
    )
    .option('--wsUrl <url>', 'Lambforge subscriptions endpoint override')
    .option(
      '--reset',
      'Forget the workspace saved for this directory and register a new one',
    )
    .action(lazy(() => import('./start').then((m) => m.default)));

  program
    .command('workspace:list')
    .description(
      'List your local workspaces (online status, directory, processes)',
    )
    .option('-p, --project <projectId>', 'Only this project')
    .action(lazy(() => import('./list').then((m) => m.default)));

  program
    .command('workspace:delete')
    .description(
      'Delete a local workspace and revoke its token (default: the one registered for this directory)',
    )
    .option('--id <id>', 'Workspace id (see `gcli workspace:list`)')
    .action(lazy(() => import('./delete').then((m) => m.default)));
}
