import { CommanderStatic } from 'commander';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { lazy } from '~/helpers';

export function registerLambdaCommands(program: CommanderStatic) {
  program
    .command('lambda:list')
    .description('List of all lambdas for project')
    .option('--project, -p', 'Specify custom token generated from the website')
    .action(
      lazy(() =>
        from(import('./list'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );

  program
    .command('lambda:get')
    .description('Get lambda by id')
    .option('--lambda, -l', 'Specify lambda id')
    .action(
      lazy(() =>
        from(import('./get'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );
}
