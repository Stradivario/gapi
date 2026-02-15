import { Command } from 'commander';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { lazy } from '~/helpers';

export function registerCronTriggerCommands(program: Command) {
  program
    .command('cron:create')
    .description('List of all environments for project')
    .option('-p, --project <project>')
    .action(
      lazy(() =>
        from(import('./create-cron'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );
}
