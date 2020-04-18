import {
  spawn,
  SpawnOptionsWithoutStdio
} from 'child_process';

interface ProcessReturn {
  data: never;
  code: number;
  error: never;
}

export const executeCommand = (
  command: string,
  args: string[] = [],
  options?: SpawnOptionsWithoutStdio
) => {
  return new Promise<ProcessReturn>((resolve, reject) => {
    const child = spawn(command, args, options);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    let data = '';
    let error = '';
    child.stderr.on('data', out => (error += out));
    child.stdout.on('data', out => {
      data += out.toString();
    });
    child.on('close', (code: number) => {
      if (code !== 0) {
        reject({ data, code, error } as ProcessReturn);
      } else {
        resolve({ data, code } as ProcessReturn);
      }
    });
  });
};
