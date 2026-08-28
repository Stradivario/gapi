import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerEnvironmentCommands(program: Command) {
  program
    .command('environment:list')
    .description('List of all environments for project')
    .option('-p, --project <project>')
    .action(lazy(() => import('./list-environments').then((m) => m.default)));

  program
    .command('environment:create')
    .description('Create environment for project')
    .option('-p, --project <project>')
    .option('-minCpu, --minCpu <minCpu>')
    .option('-maxCpu, --maxCpu <maxCpu>')
    .option('-minMemory, --minMemory <minMemory>')
    .option('-maxMemory, --maxMemory <maxMemory>')
    .option('-poolSize, --poolSize <poolSize>')
    .option('-builder, --builder <builder>')
    .option('-image, --image <image>')
    .option('-name, --name <name>')
    .option('-spec, --spec <spec>')
    .option(
      '-r, --region <region>',
      "Default region is eu-central 'DEFAULT' | 'EU_BALKANS' | 'EU_CENTRAL'",
    )
    .option(
      '-cid, --clusterId <clusterId>',
      'Private cluster this environment should run on (see cluster:list); omit for the shared cluster. Immutable after creation.',
    )
    .action(lazy(() => import('./create-environment').then((m) => m.default)));

  program
    .command('environment:update')
    .description('Update environment for project')
    .option('-p, --project <project>')
    .option('-minCpu, --minCpu <minCpu>')
    .option('-maxCpu, --maxCpu <maxCpu>')
    .option('-minMemory, --minMemory <minMemory>')
    .option('-maxMemory, --maxMemory <maxMemory>')
    .option('-poolSize, --poolSize <poolSize>')
    .option('-builder, --builder <builder>')
    .option('-image, --image <image>')
    .option('-name, --name <name>')
    .option('-spec, --spec <spec>')
    .option(
      '-r, --region <region>',
      "Default region is eu-central 'DEFAULT' | 'EU_BALKANS' | 'EU_CENTRAL'",
    )
    .action(lazy(() => import('./update-environment').then((m) => m.default)));

  program
    .command('environment:delete')
    .description('Delete environment for project')
    .option('-p, --project <project>')
    .option('-n, --name <name>')
    .option('-f, --force')
    .option('-spec, --spec <spec>')
    .action(lazy(() => import('./delete-environment').then((m) => m.default)));

  program
    .command('environment:get')
    .description('Get environment for project')
    .option('-p, --project <project>')
    .option('-n, --name <name>')
    .action(lazy(() => import('./get-environment').then((m) => m.default)));
}
