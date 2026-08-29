import 'firebase/auth';

import {
  ICreateOrUpdateLambdaInput,
  ICreateTimeTriggerInput,
  IDeleteLambdaInput,
  IFissionEnvironmentInputType,
  IFissionLogsType,
  IFissionType,
  IMutation,
  IQuery,
  IRabbitMqInstallPayload,
} from '@introspection/index';
import { LZWService } from '@rxdi/compressor';
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

import { ClusterFragment } from './types/cluster.fragment';
import { EnvironmentFragment } from './types/environment.fragment';
import { LambdaFragment } from './types/lambda.fragment';
import {
  InstalledPluginFragment,
  PluginFragment,
} from './types/plugin.fragment';
import { ProjectFragment } from './types/project.fragment';
import { RabbitMqFragment } from './types/rabbitmq.fragment';
import { TimeTriggerFragment } from './types/time-trigger.fragment';

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
          return throwError(() => 'missing-lambda');
        }
        return of(res.getLambda);
      }),
    );
  }

  public static getLambdaByName(
    name: string,
    projectId: string,
    fragments?: (keyof IFissionType)[],
    clusterId?: string,
  ) {
    return this.query<IQuery>({
      query: gql`query getLambdaByName($projectId: String!, $name: String!, $clusterId: String) {
        getLambdaByName(projectId: $projectId, name: $name, clusterId: $clusterId) {
          ${fragments?.join(' ') || LambdaFragment}
        }
      }`,
      variables: {
        name,
        projectId,
        clusterId,
      },
    }).pipe(
      switchMap((res) => {
        if (!res.getLambdaByName) {
          return throwError(() => 'missing-lambda');
        }
        return of(res.getLambdaByName);
      }),
    );
  }

  public static listLambdas(projectId: string, clusterId?: string) {
    return this.query<IQuery>({
      query: gql`query listProjectLambdas($projectId: String!, $clusterId: String){
        listProjectLambdas(projectId: $projectId, clusterId: $clusterId) {
          ${LambdaFragment}
        }
      }`,
      variables: {
        projectId,
        clusterId,
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
    }).pipe(
      map((res) => res.getLambdaLogs),
      map(
        (logs) =>
          ({
            ...logs,
            data: LZWService.decompress(logs.data),
          }) as IFissionLogsType,
      ),
    );
  }

  public static getLambdaLogsByName(
    name: string,
    projectId: string,
    clusterId?: string,
  ) {
    return this.query<IQuery>({
      query: gql`
        query getLambdaLogsByName(
          $projectId: String!
          $name: String!
          $clusterId: String
        ) {
          getLambdaLogsByName(
            projectId: $projectId
            name: $name
            clusterId: $clusterId
          ) {
            data
          }
        }
      `,
      variables: { name, projectId, clusterId },
    }).pipe(
      map((res) => res.getLambdaLogsByName),
      map(
        (logs) =>
          ({
            ...logs,
            data: LZWService.decompress(logs.data),
          }) as IFissionLogsType,
      ),
    );
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
    }).pipe(
      map((res) => res.getLambdaBuilderLogs),
      map(
        (logs) =>
          ({
            ...logs,
            data: LZWService.decompress(logs.data),
          }) as IFissionLogsType,
      ),
    );
  }

  public static getLambdaBuilderLogsByName(
    name: string,
    projectId: string,
    clusterId?: string,
  ) {
    return this.query<IQuery>({
      query: gql`
        query getLambdaBuilderLogsByName(
          $projectId: String!
          $name: String!
          $clusterId: String
        ) {
          getLambdaBuilderLogsByName(
            projectId: $projectId
            name: $name
            clusterId: $clusterId
          ) {
            data
          }
        }
      `,
      variables: { name, projectId, clusterId },
    }).pipe(
      map((res) => res.getLambdaBuilderLogsByName),
      map(
        (logs) =>
          ({
            ...logs,
            data: LZWService.decompress(logs.data),
          }) as IFissionLogsType,
      ),
    );
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

  public static getProject(id: string) {
    return this.query<IQuery>({
      query: gql`query getProject($id: String!) {
        getProject(id: $id) {
          ${ProjectFragment}
        }
      }`,
      variables: {
        id,
      },
    }).pipe(map((res) => res.listProjects));
  }

  public static listEnvironments(projectId: string) {
    return this.query<IQuery>({
      query: gql`query listEnvironmentsByProjectId($projectId: String!) {
        listEnvironmentsByProjectId(projectId: $projectId) {
          ${EnvironmentFragment}
        }
      }`,
      variables: {
        projectId,
      },
    }).pipe(map((res) => res.listEnvironmentsByProjectId));
  }

  public static getEnvironment(
    name: string,
    projectId: string,
    clusterId?: string,
  ) {
    return this.query<IQuery>({
      query: gql`query getEnvironment($name: String!, $projectId: String!, $clusterId: String) {
        getEnvironment(name: $name, projectId: $projectId, clusterId: $clusterId) {
          ${EnvironmentFragment}
        }
      }`,
      variables: {
        name,
        projectId,
        clusterId,
      },
    }).pipe(map((res) => res.getEnvironment));
  }

  public static createEnvironment(
    projectId: string,
    payload: IFissionEnvironmentInputType,
  ) {
    return this.query<IMutation>({
      query: gql`
        mutation createEnvironment(
          $projectId: String!
          $payload: FissionEnvironmentInputType!
        ) {
          createEnvironment(projectId: $projectId, payload: $payload) {
            ${EnvironmentFragment}
          }
        }
      `,
      variables: {
        projectId,
        payload,
      },
    }).pipe(map((res) => res.createEnvironment));
  }

  public static deleteEnvironment(
    name: string,
    projectId: string,
    force?: boolean,
    clusterId?: string,
  ) {
    return this.query<IMutation>({
      query: gql`
        mutation deleteEnvironmentByName(
          $name: String!
          $projectId: String!
          $force: Boolean
          $clusterId: String
        ) {
          deleteEnvironmentByName(name: $name, projectId: $projectId, force: $force, clusterId: $clusterId) {
            ${EnvironmentFragment}
          }
        }
      `,
      variables: {
        name,
        projectId,
        force,
        clusterId,
      },
    }).pipe(map((res) => res.deleteEnvironmentByName));
  }

  public static updateEnvironment(
    projectId: string,
    payload: IFissionEnvironmentInputType,
  ) {
    return this.query<IMutation>({
      query: gql`
        mutation updateEnvironmentByName(
          $projectId: String!
          $payload: FissionEnvironmentInputType!
        ) {
          updateEnvironmentByName(projectId: $projectId, payload: $payload) {
            ${EnvironmentFragment}
          }
        }
      `,
      variables: {
        projectId,
        payload,
      },
    }).pipe(map((res) => res.updateEnvironmentByName));
  }

  public static listProjectTimeTriggers(projectId: string) {
    return this.query<IQuery>({
      query: gql`
        query listProjectTimeTriggers($projectId: String!) {
          listProjectTimeTriggers(projectId: $projectId) {
            ${TimeTriggerFragment}
          }
        }
      `,
      variables: {
        projectId,
      },
    }).pipe(map((res) => res.listProjectTimeTriggers));
  }

  public static createTimeTrigger(payload: ICreateTimeTriggerInput) {
    return this.query<IMutation>({
      query: gql`
        mutation createLambdaTimeTrigger($payload: CreateTimeTriggerInput!) {
          createLambdaTimeTrigger(payload: $payload) {
            ${TimeTriggerFragment}
          }
        }
      `,
      variables: {
        payload,
      },
    }).pipe(map((res) => res.createLambdaTimeTrigger));
  }

  public static deleteLambdaTimeTrigger(lambdaId: string) {
    return this.query<IMutation>({
      query: gql`
        mutation deleteLambdaTimeTrigger($lambdaId: String!) {
          deleteLambdaTimeTrigger(lambdaId: $lambdaId) {
            ${TimeTriggerFragment}
          }
        }
      `,
      variables: {
        lambdaId,
      },
    }).pipe(map((res) => res.deleteLambdaTimeTrigger));
  }

  // --------------------------------------------------------------------
  // Cluster (project-level; resolved by cluster-provisioner via the
  // federation gateway - flat scalar mutation args, NOT a nested input
  // object, confirmed against cluster.controller.ts)
  // --------------------------------------------------------------------

  public static provisionProjectCluster(
    projectId: string,
    input: {
      name: string;
      imageId: string;
      serverType: string;
      location: string;
      workers?: number;
      singleNode?: boolean;
    },
  ) {
    return this.query<IMutation>({
      query: gql`
        mutation provisionProjectCluster(
          $projectId: String!
          $name: String!
          $imageId: String!
          $serverType: String!
          $location: String!
          $workers: Int
          $singleNode: Boolean
        ) {
          provisionProjectCluster(
            projectId: $projectId
            name: $name
            imageId: $imageId
            serverType: $serverType
            location: $location
            workers: $workers
            singleNode: $singleNode
          ) {
            ${ClusterFragment}
          }
        }
      `,
      variables: { projectId, ...input },
    }).pipe(map((res) => res.provisionProjectCluster));
  }

  public static projectClusters(projectId: string) {
    return this.query<IQuery>({
      query: gql`
        query projectClusters($projectId: String!) {
          projectClusters(projectId: $projectId) {
            ${ClusterFragment}
          }
        }
      `,
      variables: { projectId },
    }).pipe(map((res) => res.projectClusters));
  }

  public static teardownProjectCluster(projectId: string, clusterId: string) {
    return this.query<IMutation>({
      query: gql`
        mutation teardownProjectCluster(
          $projectId: String!
          $clusterId: String!
        ) {
          teardownProjectCluster(projectId: $projectId, clusterId: $clusterId) {
            ${ClusterFragment}
          }
        }
      `,
      variables: { projectId, clusterId },
    }).pipe(map((res) => res.teardownProjectCluster));
  }

  public static clusterKubeconfig(projectId: string, clusterId: string) {
    return this.query<IQuery>({
      query: gql`
        query clusterKubeconfig($projectId: String!, $clusterId: String!) {
          clusterKubeconfig(projectId: $projectId, clusterId: $clusterId)
        }
      `,
      variables: { projectId, clusterId },
    }).pipe(map((res) => res.clusterKubeconfig));
  }

  // --------------------------------------------------------------------
  // RabbitMQ brokers (graphql-server-lambdas) - a project may have
  // several, each optionally scoped to a private cluster.
  // --------------------------------------------------------------------

  public static installRabbitMq(
    projectId: string,
    payload: IRabbitMqInstallPayload & { clusterId?: string },
  ) {
    return this.query<IMutation>({
      query: gql`
        mutation installRabbitMq(
          $projectId: String!
          $payload: RabbitMqInstallPayload!
        ) {
          installRabbitMq(projectId: $projectId, payload: $payload) {
            ${RabbitMqFragment}
          }
        }
      `,
      variables: { projectId, payload },
    }).pipe(map((res) => res.installRabbitMq));
  }

  public static listRabbitMqInstances(projectId: string) {
    return this.query<IQuery>({
      query: gql`
        query listRabbitMqInstances($projectId: String!) {
          listRabbitMqInstances(projectId: $projectId) {
            ${RabbitMqFragment}
          }
        }
      `,
      variables: { projectId },
    }).pipe(map((res) => res.listRabbitMqInstances));
  }

  public static uninstallRabbitMq(id: string, projectId: string) {
    return this.query<IMutation>({
      query: gql`
        mutation uninstallRabbitMq($id: String!, $projectId: String!) {
          uninstallRabbitMq(id: $id, projectId: $projectId) {
            ${RabbitMqFragment}
          }
        }
      `,
      variables: { id, projectId },
    }).pipe(map((res) => res.uninstallRabbitMq));
  }

  // --------------------------------------------------------------------
  // Marketplace plugins (graphql-server-lambdas) - a project may have the
  // same plugin installed on several clusters simultaneously.
  // --------------------------------------------------------------------

  public static listAvailablePlugins() {
    return this.query<IQuery>({
      query: gql`
        query listAvailablePlugins {
          listAvailablePlugins {
            ${PluginFragment}
          }
        }
      `,
      variables: {},
    }).pipe(map((res) => res.listAvailablePlugins));
  }

  public static listInstalledPlugins(projectId: string) {
    return this.query<IQuery>({
      query: gql`
        query listInstalledPlugins($projectId: String!) {
          listInstalledPlugins(projectId: $projectId) {
            ${InstalledPluginFragment}
          }
        }
      `,
      variables: { projectId },
    }).pipe(map((res) => res.listInstalledPlugins));
  }

  public static installPlugin(
    projectId: string,
    pluginName: string,
    config?: Record<string, unknown>,
    clusterId?: string,
  ) {
    return this.query<IMutation>({
      query: gql`
        mutation installPlugin(
          $projectId: String!
          $pluginName: String!
          $config: JSON
          $clusterId: String
        ) {
          installPlugin(
            projectId: $projectId
            pluginName: $pluginName
            config: $config
            clusterId: $clusterId
          ) {
            ${InstalledPluginFragment}
          }
        }
      `,
      variables: { projectId, pluginName, config, clusterId },
    }).pipe(map((res) => res.installPlugin));
  }

  public static uninstallPlugin(
    projectId: string,
    pluginName: string,
    clusterId?: string,
  ) {
    return this.query<IMutation>({
      query: gql`
        mutation uninstallPlugin(
          $projectId: String!
          $pluginName: String!
          $clusterId: String
        ) {
          uninstallPlugin(
            projectId: $projectId
            pluginName: $pluginName
            clusterId: $clusterId
          )
        }
      `,
      variables: { projectId, pluginName, clusterId },
    }).pipe(map((res) => res.uninstallPlugin));
  }

  static getConfig(force = false) {
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
        expired: force || (Date.now() - timeGenerated) / 1000 > 1800,
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
          writeFileAsObservable(generationTimeDirectory, Date.now().toString()),
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
