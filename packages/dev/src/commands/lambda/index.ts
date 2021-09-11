import commander from 'commander';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { lazy } from '~/helpers';

import { createCommand } from './helpers';

export function registerLambdaCommands(program: commander.CommanderStatic) {
  program
    .command('lambda:list')
    .description('List of all lambdas for project')
    .option(
      '--project <project>, -p',
      'Specify custom token generated from the website',
    )
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
    .option('--lambda <lambda>, -l', 'get by lambda id')
    .option('--name <name>, -n', 'get by lambda name')
    .option('--project <project>, -p', 'get by lambda name')
    .option('--spec <spec>, -p', 'get by lambda name')
    .action(
      lazy(() =>
        from(import('./get'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );

  const createOrUpdateOptions: [string, string][] = [
    ['--name <name>', 'lambda name'],
    ['--project <project>', 'lambda project'],
    ['--env <env>', 'lambda project'],
    ['--method <method>', 'lambda project'],
    ['--spec <spec>', 'lambda project'],
    ['--packageJson <packageJson>', 'lambda project'],
    ['--package <package>', 'lambda project'],
    ['--buildBashScript <buildBashScript>', 'lambda project'],
    ['--script <script>', 'lambda project'],
    ['--params <params>', 'lambda project'],
    ['--route <route>', 'lambda project'],
    ['--code <code>', 'lambda project'],
    ['--file <file>', 'lambda project'],
    ['--secret <secret>', 'lambda project'],
  ];

  createCommand('lambda:create')(createOrUpdateOptions)(program).action(
    lazy(() =>
      from(import('./create'))
        .pipe(map((m) => m.default))
        .toPromise(),
    ),
  );

  createCommand('lambda:update')(createOrUpdateOptions)(program).action(
    lazy(() =>
      from(import('./update'))
        .pipe(map((m) => m.default))
        .toPromise(),
    ),
  );

  program
    .command('lambda:delete')
    .description('Get lambda by id')
    .option('--name <name>, -n', 'get by lambda name')
    .option('--project <project>, -p', 'get by lambda name')
    .option('--spec <spec>, -p', 'get by lambda name')
    .action(
      lazy(() =>
        from(import('./delete'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );

  program
    .command('lambda:log')
    .description('Get lambda log')
    .option('--lambda <lambda>, -l', 'get by lambda id')
    .option('--name <name>, -n', 'get by lambda name')
    .option('--project <project>, -p', 'get by lambda name')
    .option('--spec <spec>, -p', 'get by lambda name')
    .action(
      lazy(() =>
        from(import('./logs'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );

  program
    .command('lambda:build:log')
    .description('Get build log')
    .option('--lambda <lambda>, -l', 'get by lambda id')
    .option('--name <name>, -n', 'get by lambda name')
    .option('--project <project>, -p', 'get by lambda project')
    .option('--spec <spec>, -p', 'use configuration')
    .action(
      lazy(() =>
        from(import('./logs-builder'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );
}
