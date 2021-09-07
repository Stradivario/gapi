#! /usr/bin/env node

import chalk from 'chalk';
import program from 'commander';

import {
  registerAuthCommands,
  registerLambdaCommands,
  registerProjectCommands,
} from './commands';

export const main = (argv: string[]) => {
  program.name('gcli').version('0.0.1');

  registerAuthCommands(program);
  registerLambdaCommands(program);
  registerProjectCommands(program);

  program.on('command:*', () => {
    console.log();
    console.log(chalk.red(`Invalid command: ${program.args.join(' ')}`));
    console.log();
    program.outputHelp();
    process.exit(1);
  });

  program.parse(argv);
};

// main([...process.argv, 'lambda:list', '60112775a275dcc4042694f1']);
// main([...process.argv, 'lambda:get', '6130978bdb18c3b280113eb6']);
// main([...process.argv, 'login', '--token', 'TOKEN', '--key', 'KEY']);
