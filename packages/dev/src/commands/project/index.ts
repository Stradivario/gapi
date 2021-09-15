import { Command } from 'commander';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { lazy } from '~/helpers';

export function registerProjectCommands(program: Command) {
  program
    .command('project:list')
    .description('List of all projects')
    .action(
      lazy(() =>
        from(import('./list'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );

  program
    .command('project:use')
    .arguments('<project>')
    .description('Adds default project to be used all around the CLI')
    .action(lazy(() => import('./use').then((m) => m.default)));

  program
    .command('project:clear')
    .description('Clears default project to be used all around the CLI')
    .action(lazy(() => import('./clear').then((m) => m.default)));
}
