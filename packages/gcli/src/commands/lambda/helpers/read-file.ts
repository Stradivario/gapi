import { readFile, writeFile } from 'fs';
import { from } from 'rxjs';
import { promisify } from 'util';

export const readFileAsObservable = (file: string) =>
  from(promisify(readFile)(file, { encoding: 'utf-8' }));

// const readFilesAsObservable = (files: string[]) =>
//   combineLatest(files.map(readFileAsObservable));

export const writeFileAsObservable = (
  file: string,
  body: string | number | Buffer,
) => from(promisify(writeFile)(file, body, { encoding: 'utf-8' }));
