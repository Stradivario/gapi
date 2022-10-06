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
    ['--name <name>', 'Function name'],
    ['--project <project>', 'Project in which this lambda is defined'],
    ['--env <env>', 'Environment name for function can be NODEJS'],
    [
      '--method <method>',
      'HTTP Methods: GET,POST,PUT,DELETE,HEAD. To mention single method',
    ],
    ['--spec <spec>', 'Spec file yml or json path'],
    ['--packageJson <packageJson>', 'Define packageJson in string format'],
    ['--package <package>', 'Path to package.json'],
    [
      '--buildBashScript <buildBashScript>',
      'Package build command for builder to run with',
    ],
    ['--script <script>', 'Package build script path'],
    ['--params <params>', 'Array from strings which defines route params'],
    ['--route <route>', 'Lambda route in which will be accessible'],
    ['--code <code>', 'URL or local path for single file source code'],
    ['--file <file>', 'Main lambda file'],
    [
      '--executorType <executorType>',
      "Executor type for execution; one of 'poolmgr', 'newdeploy'",
    ],
    [
      '--maxCpu <maxCpu>',
      'Maximum CPU to be assigned to pod (In millicore, minimum 1)',
    ],
    [
      '--minCpu <minCpu>',
      'Minimum CPU to be assigned to pod (In millicore, minimum 1)',
    ],
    [
      '--maxMemory <maxMemory>',
      'Maximum memory to be assigned to pod (In megabyte)',
    ],
    [
      '--minMemory <minMemory>',
      'Minimum memory to be assigned to pod (In megabyte)',
    ],
    [
      '--minScale <minScale>',
      'Minimum number of pods (Uses resource inputs to configure HPA)',
    ],
    [
      '--maxScale <maxScale>',
      'Maximum number of pods (Uses resource inputs to configure HPA)',
    ],
    [
      '--targetCpu <targetCpu>',
      'Target average CPU usage percentage across pods for scaling',
    ],
    [
      '--idleTimeout <idleTimeout>',
      'The length of time (in seconds) that a function is idle before pod(s) are eligible for recycling',
    ],
    [
      '--concurrency <concurrency>',
      'Maximum number of pods specialized concurrently to serve requests',
    ],
    [
      '--functionTimeout <functionTimeout>',
      'Maximum time for a request to wait for the response from the function',
    ],
    [
      '--specializationTimeout <specializationTimeout>',
      'Timeout for executor to wait for function pod creation',
    ],
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
