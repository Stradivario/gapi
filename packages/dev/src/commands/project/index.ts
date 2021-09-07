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
}
