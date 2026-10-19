import { Command } from 'commander';

import { lazy } from '~/helpers';

/* Options shared by mq-trigger:create and mq-trigger:update. */
const triggerOptions = (command: Command) =>
  command
    .option('-p, --project <project>')
    .requiredOption('-n, --name <name>', 'Trigger name')
    .option('-l, --lambda <lambda>', 'Lambda the trigger runs per message')
    .option('--request-topic <queue>', 'Queue the trigger consumes')
    .option('--response-topic <queue>', 'Queue for the lambda response')
    .option('--error-topic <queue>', 'Queue for failed messages')
    .option(
      '--broker <rabbitMqId>',
      'RabbitMQ broker id (see rabbitmq:list) - needed when several brokers share queue names',
    )
    .option('--max-retries <n>')
    .option('--cool-down-period <seconds>')
    .option('--polling-interval <seconds>')
    .option('--min-replicas <n>')
    .option('--max-replicas <n>')
    .option('--threshold <n>', 'Messages per replica before scaling out');

export function registerMessageQueueTriggerCommands(program: Command) {
  program
    .command('mq-trigger:list')
    .description('List the message-queue triggers of a project')
    .option('-p, --project <project>')
    .action(lazy(() => import('./list').then((m) => m.default)));

  triggerOptions(
    program
      .command('mq-trigger:create')
      .description('Run a lambda for every message on a RabbitMQ queue'),
  ).action(
    lazy(() => import('./save').then((m) => (cmd) => m.default('create', cmd))),
  );

  triggerOptions(
    program
      .command('mq-trigger:update')
      .description('Change a message-queue trigger (same flags as create)'),
  ).action(
    lazy(() => import('./save').then((m) => (cmd) => m.default('update', cmd))),
  );

  program
    .command('mq-trigger:delete')
    .description('Delete a message-queue trigger')
    .option('-p, --project <project>')
    .requiredOption('-n, --name <name>', 'Trigger name')
    .action(lazy(() => import('./delete').then((m) => m.default)));
}
