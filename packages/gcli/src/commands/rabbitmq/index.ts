import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerRabbitMqCommands(program: Command) {
  program
    .command('rabbitmq:create')
    .description(
      'Provision a RabbitMQ broker for a project (a project may have several)',
    )
    .option('-p, --project <project>')
    .option('-spec, --spec <spec>')
    .option('-n, --name <name>')
    .option('-d, --description <description>')
    .option('-u, --user <user>')
    .option('--password <password>')
    .option('-r, --region <region>', "'DEFAULT' | 'EU_BALKANS' | 'EU_CENTRAL'")
    .option(
      '-c, --cluster <cluster>',
      'Which private cluster to provision this broker on; omit for the shared cluster',
    )
    .action(lazy(() => import('./create').then((m) => m.default)));

  program
    .command('rabbitmq:list')
    .description('List every RabbitMQ broker for a project')
    .option('-p, --project <project>')
    .action(lazy(() => import('./list').then((m) => m.default)));

  program
    .command('queue:declare')
    .description(
      'Declare queues on a RabbitMQ broker of the project (skips the ones it has)',
    )
    .option('-p, --project <project>')
    .option(
      '-n, --name <name>',
      'Queue name; repeat for several. Without it: queues.declare in lambforge.yaml',
      (value: string, all: string[] = []) => [...all, value],
    )
    .option(
      '--broker <broker>',
      'Broker name or id (see rabbitmq:list); optional when the project has one',
    )
    .option('-spec, --spec <spec>')
    .action(lazy(() => import('./declare-queue').then((m) => m.default)));

  program
    .command('rabbitmq:delete')
    .description('Delete a RabbitMQ broker')
    .option('-p, --project <project>')
    .option('--id <id>', 'Broker id (see rabbitmq:list)')
    .action(lazy(() => import('./delete').then((m) => m.default)));
}
