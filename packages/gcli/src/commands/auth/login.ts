import { mkdir, writeFile } from 'fs';
import { combineLatest, from, lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { promisify } from 'util';

import { Logger } from '~/services/log';
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
import { browserLogin } from './browser-login';

const MainLambforgeAPI = 'https://api.lambforge.com';

interface LoginOptions {
  key: string;
  url: string;
  uploadUrl: string;
  ci: boolean;
  token: string;
  /** commander's --no-browser */
  browser?: boolean;
  /** No stdout output (mcp:start: stdout is the MCP channel). */
  silent?: boolean;
}

/** No --token: log in through the browser (the server issues the token
    and the web API key), then continue exactly like a pasted command. */
export default async (cmd: LoginOptions) => {
  if (!cmd.token && !cmd.ci) {
    const { token, key } = await browserLogin(cmd.url || MainLambforgeAPI, {
      openBrowser: cmd.browser !== false,
    });
    return loginWithToken({ ...cmd, token, key: cmd.key || key });
  }
  if (!cmd.key && !cmd.ci) {
    throw new Error(
      '--key is required with --token (or run `gcli login` alone to log in through the browser)',
    );
  }
  return loginWithToken(cmd);
};

export const loginWithToken = (cmd: LoginOptions) =>
  lastValueFrom(
    of(GraphqlClienAPI.init(cmd.key)).pipe(
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
                promisify(writeFile)(
                  urlDirectory,
                  cmd.url ? cmd.url : MainLambforgeAPI,
                  {
                    encoding: 'utf-8',
                  },
                ),
                promisify(writeFile)(keyDirectory, cmd.key, {
                  encoding: 'utf-8',
                }),
                promisify(writeFile)(
                  uploadUrlDirectory,
                  cmd.uploadUrl
                    ? cmd.uploadUrl
                    : cmd.url
                      ? `${cmd.url}/upload-lambda`
                      : `${MainLambforgeAPI}/upload-lambda`,
                  {
                    encoding: 'utf-8',
                  },
                ),
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
            tap(
              (user) =>
                cmd.silent ||
                Logger.log(
                  'Logged in as',
                  `"${user?.displayName}"`,
                  'with email',
                  `"${user?.email}"`,
                ),
            ),
          ),
      ),
    ),
  );
