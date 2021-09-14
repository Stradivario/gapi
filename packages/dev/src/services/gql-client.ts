import 'firebase/auth';

import {
  ICreateOrUpdateLambdaInput,
  IDeleteLambdaInput,
  IFissionType,
  IMutation,
  IQuery,
} from '@introspection/index';
import * as firebase from 'firebase/app';
import { combineLatest, from, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  readFileAsObservable,
  writeFileAsObservable,
} from '~/commands/lambda/helpers/read-file';
import {
  generationTimeDirectory,
  keyDirectory,
  refreshTokenDirectory,
  tokenDirectory,
  uploadUrlDirectory,
  urlDirectory,
} from '~/types';

import { LambdaFragment } from './types/lambda.fragment';
import { ProjectFragment } from './types/project.fragment';

export function gql(...args) {
  const literals = args[0];
  let result = typeof literals === 'string' ? literals : literals[0];

  for (let i = 1; i < args.length; i++) {
    if (args[i] && args[i].kind && args[i].kind === 'Document') {
      result += args[i].loc.source.body;
    } else {
      result += args[i];
    }

    result += literals[i];
  }

  return result;
}

export class GraphqlClienAPI {
  public static query<T>({
    query,
    variables,
  }: {
    query: string;
    variables?: Record<string, unknown>;
  }) {
    return this.getConfig().pipe(
      switchMap(({ token, url }) =>
        from(
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: token,
              Accept: 'application/json',
            },
            body: JSON.stringify({ query, variables }),
          }),
        ).pipe(
          switchMap((res) => res.json()),
          map(({ data, errors }) => {
            if (errors?.length) {
              throw new Error(JSON.stringify(errors, null, 2));
            }
            if (!data) {
              throw new Error('missing-entry');
            }
            return data as T;
          }),
        ),
      ),
    );
  }

  public static getLambda(
    lambdaId: string,
    fragments?: (keyof IFissionType)[],
  ) {
    return this.query<IQuery>({
      query: gql`query getLambda($lambdaId: String!) {
        getLambda(lambdaId: $lambdaId) {
          ${fragments?.join(' ') || LambdaFragment}
        }
      }`,
      variables: { lambdaId },
    }).pipe(
      switchMap((res) => {
        if (!res.getLambda) {
          return throwError('missing-lambda');
        }
        return of(res.getLambda);
      }),
    );
  }

  public static getLambdaByName(
    name: string,
    projectId: string,
    fragments?: (keyof IFissionType)[],
  ) {
    return this.query<IQuery>({
      query: gql`query getLambdaByName($projectId: String!, $name: String!) {
        getLambdaByName(projectId: $projectId, name: $name) {
          ${fragments?.join(' ') || LambdaFragment}
        }
      }`,
      variables: {
        name,
        projectId,
      },
    }).pipe(
      switchMap((res) => {
        if (!res.getLambdaByName) {
          return throwError('missing-lambda');
        }
        return of(res.getLambdaByName);
      }),
    );
  }

  public static listLambdas(projectId: string) {
    return this.query<IQuery>({
      query: gql`query listProjectLambdas($projectId: String!){
        listProjectLambdas(projectId: $projectId) {
          ${LambdaFragment}
        }
      }`,
      variables: {
        projectId,
      },
    }).pipe(map((res) => res.listProjectLambdas));
  }

  public static createLambda(payload: ICreateOrUpdateLambdaInput) {
    return this.query<IMutation>({
      query: gql`mutation createLambda($payload: CreateOrUpdateLambdaInput!) {
        createLambda(payload: $payload) {
          ${LambdaFragment}
        }
      }`,
      variables: { payload },
    }).pipe(map((res) => res.createLambda));
  }

  public static updateLambda(payload: ICreateOrUpdateLambdaInput) {
    return this.query<IMutation>({
      query: gql`mutation updateLambda($payload: CreateOrUpdateLambdaInput!) {
        updateLambda(payload: $payload) {
          ${LambdaFragment}
        }
      }`,
      variables: { payload },
    }).pipe(map((res) => res.updateLambda));
  }

  public static getLambdaLogs(lambdaId: string) {
    return this.query<IQuery>({
      query: gql`
        query getLambdaLogs($lambdaId: String!) {
          getLambdaLogs(lambdaId: $lambdaId) {
            data
          }
        }
      `,
      variables: { lambdaId },
    }).pipe(map((res) => res.getLambdaLogs));
  }

  public static getLambdaLogsByName(name: string, projectId: string) {
    return this.query<IQuery>({
      query: gql`
        query getLambdaLogsByName($projectId: String!, $name: String!) {
          getLambdaLogsByName(projectId: $projectId, name: $name) {
            data
          }
        }
      `,
      variables: { name, projectId },
    }).pipe(map((res) => res.getLambdaLogsByName));
  }

  public static getLambdaBuilderLogs(lambdaId: string) {
    return this.query<IQuery>({
      query: gql`
        query getLambdaBuilderLogs($lambdaId: String!) {
          getLambdaBuilderLogs(lambdaId: $lambdaId) {
            data
          }
        }
      `,
      variables: { lambdaId },
    }).pipe(map((res) => res.getLambdaBuilderLogs));
  }

  public static getLambdaBuilderLogsByName(name: string, projectId: string) {
    return this.query<IQuery>({
      query: gql`
        query getLambdaBuilderLogsByName($projectId: String!, $name: String!) {
          getLambdaBuilderLogsByName(projectId: $projectId, name: $name) {
            data
          }
        }
      `,
      variables: { name, projectId },
    }).pipe(map((res) => res.getLambdaBuilderLogsByName));
  }

  public static deleteLambda(payload: IDeleteLambdaInput) {
    return this.query<IMutation>({
      query: gql`
        mutation deleteLambda($payload: DeleteLambdaInput!) {
          deleteLambda(payload: $payload) {
            ${LambdaFragment}
          }
        }
      `,
      variables: { payload },
    }).pipe(map((res) => res.deleteLambda));
  }

  public static listProjects() {
    return this.query<IQuery>({
      query: gql`query listProjects {
        listProjects {
          ${ProjectFragment}
        }
      }`,
    }).pipe(map((res) => res.listProjects));
  }
  static getConfig() {
    return combineLatest([
      readFileAsObservable(tokenDirectory),
      readFileAsObservable(urlDirectory),
      readFileAsObservable(refreshTokenDirectory),
      readFileAsObservable(keyDirectory),
      readFileAsObservable(generationTimeDirectory).pipe(
        map((date) => Number(date)),
      ),
      readFileAsObservable(uploadUrlDirectory),
    ]).pipe(
      map(([token, url, refresh, key, timeGenerated, uploadUrl]) => ({
        token,
        url,
        refresh,
        key,
        timeGenerated,
        expired: (Date.now() - timeGenerated) / 1000 > 3600,
        uploadUrl,
      })),
      switchMap((config) =>
        config.expired
          ? this.refreshToken(config.key, config.refresh).pipe(
              map(({ id_token }) => ({ ...config, token: id_token })),
            )
          : of(config),
      ),
    );
  }

  private static refreshToken(key: string, refresh_token: string) {
    return from(
      fetch(`https://securetoken.googleapis.com/v1/token?key=${key}`, {
        method: 'POST',
        body: JSON.stringify({
          refresh_token,
          grant_type: 'refresh_token',
        }),
      }),
    ).pipe(
      switchMap(
        (res) =>
          res.json() as Promise<{
            access_token: string;
            expires_in: string;
            token_type: 'Baerer';
            refresh_token: string;
            id_token: string;
            user_id: string;
          }>,
      ),
      switchMap((cfg) =>
        combineLatest([
          writeFileAsObservable(tokenDirectory, cfg.id_token),
          writeFileAsObservable(refreshTokenDirectory, cfg.refresh_token),
          writeFileAsObservable(generationTimeDirectory, Date.now()),
        ]).pipe(map(() => cfg)),
      ),
    );
  }

  public static signIn(customToken: string) {
    return from(firebase.auth().signInWithCustomToken(customToken)).pipe(
      switchMap(({ user }) =>
        combineLatest([user.getIdToken(), of(user.refreshToken)]).pipe(
          map(([token, refresh]) => ({ user, token, refresh })),
        ),
      ),
    );
  }

  public static init(apiKey: string) {
    firebase.initializeApp({
      apiKey,
    });
  }
}
