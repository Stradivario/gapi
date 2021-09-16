#! /usr/bin/env node

import chalk from 'chalk';
import { program } from 'commander';
import fetch from 'node-fetch';

import { commands } from './commands';

export const main = (argv: string[]) => {
  program.name('gcli').version('0.0.1');

  commands.map((command) => command(program));

  program.on('command:*', () => {
    console.log();
    console.log(chalk.red(`Invalid command: ${program.args.join(' ')}`));
    console.log();
    program.outputHelp();
    process.exit(1);
  });

  program.parse(argv);
};

global.fetch = fetch as never;

/* If command is executed without arguments show help page */
if (process.argv.length === 2) {
  process.argv.push('-h');
}

main(process.argv);
