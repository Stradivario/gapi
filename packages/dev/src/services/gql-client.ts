import 'firebase/auth';

import {
  ICreateOrUpdateLambdaInput,
  IDeleteLambdaInput,
  IMutation,
  IQuery,
} from '@introspection/index';
import * as firebase from 'firebase/app';
import { readFile } from 'fs';
import fetch from 'node-fetch';
import { combineLatest, from, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { promisify } from 'util';

import { tokenDirectory, urlDirectory } from '~/types';

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
            if (!data) {
              throw new Error('missing-entry');
            }
            if (errors?.length) {
              throw new Error(JSON.stringify(errors, null, 2));
            }
            return data as T;
          }),
        ),
      ),
    );
  }

  public static getLambda(lambdaId: string) {
    return this.query<IQuery>({
      query: gql`query getLambda($lambdaId: String!) {
        getLambda(lambdaId: $lambdaId) {
          ${LambdaFragment}
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

  public static getLambdaByName(name: string, projectId: string) {
    return this.query<IQuery>({
      query: gql`query getLambdaByName($projectId: String!, $name: String!) {
        getLambdaByName(projectId: $projectId, name: $name) {
          ${LambdaFragment}
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
  private static getConfig() {
    return combineLatest([
      from(promisify(readFile)(tokenDirectory, { encoding: 'utf-8' })),
      from(promisify(readFile)(urlDirectory, { encoding: 'utf-8' })),
    ]).pipe(map(([token, url]) => ({ token, url })));
  }

  public static signIn(customToken: string) {
    return from(firebase.auth().signInWithCustomToken(customToken)).pipe(
      switchMap(({ user }) =>
        from(user.getIdToken()).pipe(map((token) => ({ user, token }))),
      ),
    );
  }

  public static init(apiKey: string) {
    firebase.initializeApp({
      apiKey,
    });
  }
}
