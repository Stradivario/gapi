import { Command } from 'commander';
import { mkdir, writeFile } from 'fs';
import { from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { promisify } from 'util';

import { mainDirectory, tokenDirectory, urlDirectory } from '~/types';

import { GraphqlClienAPI } from '../../services/gql-client';

export default async (cmd: Command) =>
  of(GraphqlClienAPI.init(cmd.key))
    .pipe(
      switchMap(() =>
        from(promisify(mkdir)(mainDirectory))
          .pipe(
            catchError(() => of(true)),
            switchMap(() =>
              from(
                promisify(writeFile)(urlDirectory, cmd.url, {
                  encoding: 'utf-8',
                }),
              ),
            ),
          )
          .pipe(
            switchMap(() => GraphqlClienAPI.signIn(cmd.token).toPromise()),
            switchMap(({ user }) =>
              from(user.getIdToken()).pipe(
                switchMap((userToken) =>
                  from(
                    promisify(writeFile)(tokenDirectory, userToken, {
                      encoding: 'utf-8',
                    }),
                  ).pipe(map(() => user)),
                ),
              ),
            ),
            tap((user) =>
              console.log(
                'Logged in as',
                `"${user.displayName}"`,
                'with email',
                `"${user.email}"`,
              ),
            ),
          ),
      ),
    )
    .toPromise();
