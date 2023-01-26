import { mkdir, writeFile } from 'fs';
import { combineLatest, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { promisify } from 'util';

import {
  generationTimeDirectory,
  keyDirectory,
  mainDirectory,
  refreshTokenDirectory,
  tokenDirectory,
  uploadUrlDirectory,
  urlDirectory,
} from '~/types';

import { GraphqlClienAPI } from '../../services/gql-client';

export default (cmd: {
  key: string;
  url: string;
  uploadUrl: string;
  ci: boolean;
  token: string;
}) =>
  of(GraphqlClienAPI.init(cmd.key))
    .pipe(
      switchMap(() =>
        from(promisify(mkdir)(mainDirectory))
          .pipe(
            catchError(() => of(true)),
            switchMap(() =>
              combineLatest([
                promisify(writeFile)(
                  generationTimeDirectory,
                  Date.now().toString(),
                  {
                    encoding: 'utf-8',
                  },
                ),
                promisify(writeFile)(urlDirectory, cmd.url, {
                  encoding: 'utf-8',
                }),
                promisify(writeFile)(keyDirectory, cmd.key, {
                  encoding: 'utf-8',
                }),
                promisify(writeFile)(uploadUrlDirectory, cmd.uploadUrl, {
                  encoding: 'utf-8',
                }),
              ]),
            ),
          )
          .pipe(
            switchMap(() =>
              cmd.ci
                ? of({
                    user: {
                      displayName: 'Integration Account for CI/CD',
                      email: 'support@graphql-server.com',
                    } as firebase.User,
                    refresh: cmd.token,
                    token: cmd.token,
                  })
                : GraphqlClienAPI.signIn(cmd.token).toPromise(),
            ),
            switchMap(({ user, refresh, token }) =>
              combineLatest([
                promisify(writeFile)(tokenDirectory, token, {
                  encoding: 'utf-8',
                }),
                promisify(writeFile)(refreshTokenDirectory, refresh, {
                  encoding: 'utf-8',
                }),
              ]).pipe(map(() => user)),
            ),
            tap((user) =>
              console.log(
                'Logged in as',
                `"${user?.displayName}"`,
                'with email',
                `"${user?.email}"`,
              ),
            ),
          ),
      ),
    )
    .toPromise();
