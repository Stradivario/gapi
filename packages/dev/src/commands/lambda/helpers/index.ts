import {
  IHttpMethodsEnum,
  ILambdaEnvironmentsEnum,
} from '@introspection/index';
import { CommanderStatic } from 'commander';
import { readFile } from 'fs';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { promisify } from 'util';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';

import { loadSpec } from './load-spec';

function ReadFile(file: string): Observable<string> {
  return from(promisify(readFile)(file, { encoding: 'utf-8' })).pipe(
    catchError(() => of('')),
  );
}

export interface CreateOrUpdateLambdaArguments {
  project: string;
  spec: string;
  file: string;
  code: string;
  name: string;
  route: string;
  script: string;
  buildBashScript: string;
  config: string;
  secret: string;
  env: ILambdaEnvironmentsEnum;
  method: IHttpMethodsEnum;
  packageJson: string;
  package: string;
  params: string[];
}

export const createOrUpdateLambda = (
  cmd: CreateOrUpdateLambdaArguments,
  type: 'createLambda' | 'updateLambda',
) =>
  parseProjectId(cmd.project)
    .pipe(
      switchMap(async (projectId) => ({
        projectId,
        ...(await loadSpec(cmd.spec).toPromise()),
      })),
      switchMap(async (payload) =>
        GraphqlClienAPI[type]({
          code:
            cmd.code ||
            (await ReadFile(payload.file || cmd.file).toPromise()) ||
            '',
          name: payload.name || (cmd.name as never) || '',
          projectId: payload.projectId,
          route: cmd.route || payload.route || '',
          buildBashScript:
            cmd.buildBashScript ||
            (await ReadFile(payload.script || cmd.script).toPromise()) ||
            '',
          config: payload.config || cmd.config || '',
          env: cmd.env || payload.env || 'NODEJS',
          method: cmd.method || payload.method || 'GET',
          packageJson:
            cmd.packageJson ||
            (await ReadFile(payload.package || cmd.package).toPromise()) ||
            '{}',
          params: cmd.params || payload.params || [],
          secret: cmd.secret || payload.secret || '',
        }).toPromise(),
      ),
      tap((data) => {
        console.dir(data, { depth: null, colors: true });
      }),
    )
    .toPromise();

export const createCommand = (command: string) => (
  options: [string, string][],
) => (program: CommanderStatic) => {
  const cmd = program.command(command);

  for (const option of options) {
    cmd.option(...option);
  }
  return cmd as CommanderStatic;
};
