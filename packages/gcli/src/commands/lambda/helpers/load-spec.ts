import {
  IHttpMethodsEnum,
  ILambdaScaleInputOptions,
} from '@introspection/index';
import { load } from 'js-yaml';
import { combineLatest, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { readFileAsObservable } from './read-file';

interface ConfigJSON {
  name: string;
  route: string;
  file: string;
  env: string;
  method?: IHttpMethodsEnum[];
  script?: string;
  package?: string;
  params?: string[];
  config?: string;
  secrets?: string[];
  network?: string[];
  uploadAsZip?: string;
  scaleOptions?: ILambdaScaleInputOptions;
}

export const loadSpec = <T = ConfigJSON>(spec?: string) =>
  combineLatest([
    readFileAsObservable(spec).pipe(
      map((spec) => JSON.parse(spec)),
      catchError(() =>
        from(readFileAsObservable(spec)).pipe(
          map((file) => load(file)),
          catchError(() => of(false)),
        ),
      ),
    ),
    readFileAsObservable('spec.json').pipe(
      map((spec) => JSON.parse(spec)),
      catchError(() => of(false)),
    ),
    readFileAsObservable('spec.yaml').pipe(
      map((data) => load(data)),
      catchError(() => of(false)),
    ),
  ]).pipe(map(([custom, json, yaml]) => (custom || json || yaml) as T));
