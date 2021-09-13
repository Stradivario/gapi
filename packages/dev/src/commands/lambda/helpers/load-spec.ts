import {
  IHttpMethodsEnum,
  ILambdaEnvironmentsEnum,
} from '@introspection/index';
import { readFile, stat } from 'fs';
import yaml from 'js-yaml';
import { combineLatest, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { promisify } from 'util';

interface ConfigJSON {
  name: string;
  route: string;
  file: string;
  env: ILambdaEnvironmentsEnum;
  method?: IHttpMethodsEnum;
  script?: string;
  package?: string;
  params?: string[];
  config?: string;
  secret?: string;
  uploadAsZip?: string;
}

export const loadSpec = (spec?: string) =>
  combineLatest([
    from(promisify(stat)(spec)).pipe(
      switchMap(() =>
        promisify(readFile)(spec, {
          encoding: 'utf-8',
        }),
      ),
      map((spec) => JSON.parse(spec)),
      catchError(() =>
        from(
          promisify(readFile)(spec, {
            encoding: 'utf-8',
          }),
        ).pipe(
          map((file) => yaml.load(file)),
          catchError(() => of(false)),
        ),
      ),
    ),
    from(promisify(stat)('spec.json')).pipe(
      map(() => 'spec.json'),
      switchMap((file) =>
        promisify(readFile)(file, {
          encoding: 'utf-8',
        }),
      ),
      map((spec) => JSON.parse(spec)),
      catchError(() => of(false)),
    ),
    from(promisify(stat)('spec.yaml')).pipe(
      switchMap(async () =>
        yaml.load(
          await promisify(readFile)('spec.yaml', {
            encoding: 'utf-8',
          }),
        ),
      ),
      catchError(() => of(false)),
    ),
  ]).pipe(
    map(([custom, json, yaml]) => (custom || json || yaml) as ConfigJSON),
  );
