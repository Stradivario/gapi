import { Service } from '@rxdi/core';
import { ExecOptions } from 'child_process';
import { exec } from 'shelljs';

@Service()
export class ExecService {
  call(command: string, options?: ExecOptions) {
    return new Promise((resolve, reject) => {
      exec(command, options, (code: number, stdout: string, stderr: string) => {
        if (code !== 0) {
          reject(stderr);
        }
        resolve(stdout);
      });
    });
  }
}
