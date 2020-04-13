import { Injectable } from '@rxdi/core';
import { spawn } from 'child_process';

@Injectable()
export class ChildService {
  spawn(
    command: string,
    args: string[],
    cwd: string,
    wait: number = 30 * 1000
  ) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { cwd, detached: true });
      const timeout = setTimeout(() => {
        const message = `${command} ${args.toString()} exited with timeout after ${wait /
          1000} seconds`;
        child.kill(message as never);
        reject(message);
        clearTimeout(timeout);
      }, wait);
      child.stdout.on('data', data => process.stdout.write(data));
      child.stderr.on('data', data => process.stderr.write(data));
      child.on('close', code => {
        clearTimeout(timeout);
        if (!code) {
          resolve(code);
        } else {
          reject(code);
        }
      });
    });
  }
}
