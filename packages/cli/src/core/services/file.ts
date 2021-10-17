import { Service } from '@rxdi/core';
import {
  existsSync,
  readdir,
  readFileSync,
  stat,
  writeFile,
  writeFileSync,
} from 'fs';
import { resolve } from 'path';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { mkdirp } from '../helpers/mkdirp';

@Service()
export class FileService {
  writeFile(folder: string, fileName, moduleName, file) {
    return this.mkdirp(folder).pipe(
      tap(() => {
        console.log(
          `Bootstrap: @Service('${moduleName}'): Saved inside ${folder}`
        );
      }),
      switchMap(() => this.writeFileAsyncP(folder, fileName, file))
    );
  }

  writeFileAsync(folder: string, fileName, moduleName, file) {
    return this.mkdirp(folder).pipe(
      switchMap(() => this.writeFileAsyncP(folder, fileName, file)),
      map(() => {
        console.log(
          `Bootstrap: external @Module('${moduleName}') namespace: Saved inside ${folder}`
        );
        return `${folder}/${fileName}`;
      })
    );
  }

  writeFileSync(folder, file) {
    return writeFileSync.bind(null)(
      folder,
      JSON.stringify(file, null, 2) + '\n',
      { encoding: 'utf-8' }
    );
  }

  readFile(file: string) {
    return JSON.parse(readFileSync.bind(null)(file, { encoding: 'utf-8' }));
  }

  isPresent(path: string) {
    return existsSync(path);
  }

  writeFileAsyncP(folder, fileName, content) {
    return new Observable((o) =>
      writeFile(`${folder}/${fileName}`, content, () => o.next(true))
    );
  }

  mkdirp(folder): Observable<boolean> {
    return new Observable((observer) => {
      mkdirp(folder, (err) => {
        if (err) {
          console.error(err);
          observer.error(false);
        } else {
          observer.next(true);
        }
        observer.complete();
      });
    });
  }

  public fileWalker(
    dir: string,
    exclude = 'node_modules'
  ): Observable<string[]> {
    return new Observable((observer) => {
      this.filewalker(
        dir,
        (err, result) => {
          if (err) {
            observer.error(err);
          } else {
            observer.next(result);
          }
          observer.complete();
        },
        exclude
      );
    });
  }

  private filewalker(
    dir: string,
    done: (err: NodeJS.ErrnoException, data?) => void,
    exclude = 'node_modules'
  ) {
    let results = [];
    const fileWalker = this.filewalker.bind(this);
    readdir(dir, (err, list) => {
      if (err) {
        return done(err);
      }
      let pending = list.length;
      if (!pending) {
        return done(null, results);
      }
      list.forEach((file) => {
        file = resolve(dir, file);
        stat(file, (err, stat) => {
          if (stat && stat.isDirectory()) {
            results.push(file);
            if (!file.includes(exclude)) {
              fileWalker(
                file,
                (err, res) => {
                  results = results.concat(res);
                  if (!--pending) {
                    done(null, results);
                  }
                },
                exclude
              );
            } else if (!--pending) {
              done(null, results);
            }
          } else {
            results.push(file);
            if (!--pending) {
              done(null, results);
            }
          }
        });
      });
    });
  }
}
