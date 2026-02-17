import { Command } from 'commander';
import { from, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

import { lazy } from '~/helpers';

export function registerEnvironmentCommands(program: Command) {
  program
    .command('environment:list')
    .description('List of all environments for project')
    .option('-p, --project <project>')
    .action(
      lazy(() =>
        lastValueFrom(
          from(import('./list-environments')).pipe(map((m) => m.default)),
        ),
      ),
    );

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
    .action(
      lazy(() =>
        lastValueFrom(
          from(import('./create-environment')).pipe(map((m) => m.default)),
        ),
      ),
    );

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
    .action(
      lazy(() =>
        lastValueFrom(
          from(import('./update-environment')).pipe(map((m) => m.default)),
        ),
      ),
    );

  program
    .command('environment:delete')
    .description('Delete environment for project')
    .option('-p, --project <project>')
    .option('-n, --name <name>')
    .option('-f, --force')
    .option('-spec, --spec <spec>')
    .action(
      lazy(() =>
        lastValueFrom(
          from(import('./delete-environment')).pipe(map((m) => m.default)),
        ),
      ),
    );

  program
    .command('environment:get')
    .description('Get environment for project')
    .option('-p, --project <project>')
    .option('-n, --name <name>')
    .action(
      lazy(() =>
        lastValueFrom(
          from(import('./get-environment')).pipe(map((m) => m.default)),
        ),
      ),
    );
}
