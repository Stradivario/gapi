import { CommanderStatic } from 'commander';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { lazy } from '~/helpers';

export function registerProjectCommands(program: CommanderStatic) {
  program
    .command('project:list')
    .description('List of all projects')
    .option('--project, -p', 'Specify custom token generated from the website')
    .action(
      lazy(() =>
        from(import('./list'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );

  program
    .command('project:use')
    .description('Adds default project to be used all around the CLI')
    .option('--project <project>, -p', 'Specify project id')
    .action(lazy(() => import('./use').then((m) => m.default)));
}
