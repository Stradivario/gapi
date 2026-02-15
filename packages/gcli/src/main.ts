#! /usr/bin/env node

import { existsSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getAsset, isSea } from 'node:sea';

/**
 * 1. ESBUILD BINARY INITIALIZATION (BEFORE ANYTHING ELSE)
 * Extracts the native binary from the SEA assets and prepares it for execution.
 */
const tempBinaryPath = path.join(
  os.tmpdir(),
  'esbuild-gcli-' + os.userInfo().username,
);

if (typeof isSea === 'function' && isSea()) {
  try {
    const assetArrayBuffer = getAsset('esbuild-native');

    if (assetArrayBuffer) {
      const assetBuffer = Buffer.from(assetArrayBuffer);

      // Write the binary file to the temp directory if it doesn't already exist
      if (!existsSync(tempBinaryPath)) {
        writeFileSync(tempBinaryPath, assetBuffer, { mode: 0o755 });
      }

      // Instruct esbuild where to find its native core before it's loaded
      process.env.ESBUILD_BINARY_PATH = tempBinaryPath;
    }
  } catch (e) {
    if (e.code !== 'ERR_NOT_IN_SINGLE_EXECUTABLE_APPLICATION') {
      console.error('SEA Initialization Error:', e);
    }
    // In development mode (node index.js), we simply continue normally
  }
} else {
  // Fallback for development/npm mode
  process.env.ESBUILD_BINARY_PATH = path.join(__dirname, 'esbuild');
}

/**
 * 2. DEPENDENCY IMPORTS
 */
import chalk from 'chalk';
import { program } from 'commander';
import fetch from 'node-fetch';

// Important: commands are imported AFTER setting ESBUILD_BINARY_PATH
import { commands } from './commands';

/**
 * 3. CORE LOGIC
 */
export const main = (argv: string[]) => {
  program.name('gcli').version('0.0.1');

  // Registering CLI commands
  commands.map((command) => command(program));

  // Handling invalid commands
  program.on('command:*', () => {
    console.log();
    console.log(chalk.red(`Invalid command: ${program.args.join(' ')}`));
    console.log();
    program.outputHelp();
    process.exit(1);
  });

  program.parse(argv);
};

// Fetch polyfill (if required for older Node.js versions)
global.fetch = fetch as never;

/* If the command is executed without arguments, show the help page */
if (process.argv.length === 2) {
  process.argv.push('-h');
}

// Startup
main(process.argv);
