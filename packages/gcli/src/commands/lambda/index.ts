import { Command } from 'commander';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { lazy } from '~/helpers';

import { createCommand } from './helpers';

export function registerLambdaCommands(program: Command) {
  program
    .command('lambda:list')
    .description('List of all lambdas for project')
    .option(
      '-p, --project <project>',
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
    .option('-l, --lambda <lambda>', 'get by lambda id')
    .option('-n, --name <name>', 'get by lambda name')
    .option('-p, --project <project>', 'get by lambda name')
    .option('-p, --spec <spec>', 'get by lambda name')
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
    .option('-n, --name <name>', 'get by lambda name')
    .option('-p, --project <project>', 'get by lambda name')
    .option('-s, --spec <spec>', 'get by lambda name')
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
    .option('-l, --lambda <lambda>', 'get by lambda id')
    .option('-n, --name <name>', 'get by lambda name')
    .option('-p, --project <project>', 'get by lambda name')
    .option('-s, --spec <spec>', 'get by lambda name')
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
    .option('-l, --lambda <lambda>', 'get by lambda id')
    .option('-n, --name <name>', 'get by lambda name')
    .option('-p, --project <project>', 'get by lambda project')
    .option('-s, --spec <spec>', 'use configuration')
    .action(
      lazy(() =>
        from(import('./logs-builder'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );

  program
    .command('lambda:test')
    .description('Test lambda')
    .option('-l, --lambda <lambda>', 'get by lambda id')
    .option('-n, --name <name>', 'get by lambda name')
    .option('-p, --project <project>', 'get by lambda name')
    .option('-s, --spec <spec>', 'get by lambda name')
    .option('-qp, --queryParams <queryParams>', 'Adds query params to request')
    .option('-pp, --pathParams <pathParams>', 'Adds query params to request')
    .option('-b, --body <body>', 'Add body to request')
    .action(
      lazy(() =>
        from(import('./test'))
          .pipe(map((m) => m.default))
          .toPromise(),
      ),
    );
}
