import 'firebase/auth';

import { IQuery } from '@introspection/index';
import * as firebase from 'firebase/app';
import { readFile } from 'fs';
import fetch from 'node-fetch';
import { combineLatest, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { promisify } from 'util';

import { tokenDirectory, urlDirectory } from '~/types';

import { LambdaFragment } from './types/lambda.fragment';
import { ProjectFragment } from './types/project.fragment';

export class GraphqlClienAPI {
  public static query(query: string) {
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
            body: JSON.stringify({ query }),
          }),
        ).pipe(
          switchMap((res) => res.json()),
          map(({ data, errors }) => {
            if (errors?.length) {
              throw new Error(JSON.stringify(errors, null, 2));
            }
            return data as IQuery;
          }),
        ),
      ),
    );
  }

  public static getLambda(lambdaId: string) {
    return this.query(
      `{getLambda(lambdaId: "${lambdaId}") {${LambdaFragment}}}`,
    ).pipe(map((res) => res.getLambda));
  }

  public static listLambdas(projectId: string) {
    return this.query(
      `{listProjectLambdas(projectId: "${projectId}") {${LambdaFragment}}}`,
    ).pipe(map((res) => res.listProjectLambdas));
  }

  public static listProjects() {
    return this.query(`{listProjects {${ProjectFragment}}}`).pipe(
      map((res) => res.listProjects),
    );
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
