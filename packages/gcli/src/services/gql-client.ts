import 'firebase/auth';

import {
  ICluster,
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
import { LocalRunner } from '~/commands/runner/types';
import {
  Workflow,
  WorkflowDefinition,
  WorkflowDraft,
  WorkflowRun,
  WorkflowTriggerInput,
  WorkflowValidation,
} from '~/commands/workflow/types';
import { LocalWorkspace } from '~/commands/workspace/types';
import {
  generationTimeDirectory,
  keyDirectory,
  refreshTokenDirectory,
  tokenDirectory,
  uploadUrlDirectory,
  urlDirectory,
} from '~/types';

import {
  ClusterAutoscaleFragment,
  ClusterAutoscalePolicy,
  ClusterChange,
  ClusterChangeFragment,
  ClusterHealthFragment,
  ClusterHealthSnapshot,
  ClusterOverview,
  ClusterOverviewFragment,
  ClusterScaleEvent,
  ClusterScaleEventFragment,
} from '../commands/cluster/types';
import { ClusterFragment } from './types/cluster.fragment';
import { EnvironmentFragment } from './types/environment.fragment';
import { LambdaFragment } from './types/lambda.fragment';
import { LocalRunnerFragment } from './types/local-runner.fragment';
import { LocalWorkspaceFragment } from './types/local-workspace.fragment';
import {
  InstalledPluginFragment,
  PluginFragment,
} from './types/plugin.fragment';
import { ProjectFragment } from './types/project.fragment';
import { RabbitMqFragment } from './types/rabbitmq.fragment';
import { TimeTriggerFragment } from './types/time-trigger.fragment';
import {
  WorkflowFragment,
  WorkflowRunDetailsFragment,
  WorkflowRunFragment,
} from './types/workflow.fragment';

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

/** Message-queue trigger (not in the bundled introspection yet). */
export interface MessageQueueTrigger {
  id: string;
  name: string;
  lambdaName: string;
  requestTopic: string;
  responseTopic?: string | null;
  errorTopic?: string | null;
  rabbitMqId?: string | null;
  clusterName?: string | null;
  maxRetries?: number | null;
  coolDownPeriod?: number | null;
  pollingInterval?: number | null;
  minReplicaCount?: number | null;
  maxReplicaCount?: number | null;
  threshold?: number | null;
}

export interface MessageQueueTriggerInput {
  name: string;
  lambdaName?: string;
  requestTopic?: string;
  responseTopic?: string;
  errorTopic?: string;
  rabbitMqId?: string;
  maxRetries?: number;
  coolDownPeriod?: number;
  pollingInterval?: number;
  minReplicaCount?: number;
  maxReplicaCount?: number;
  threshold?: number;
}

const MessageQueueTriggerFragment = `
  id
  name
  lambdaName
  requestTopic
  responseTopic
  errorTopic
  rabbitMqId
  clusterName
  maxRetries
  coolDownPeriod
  pollingInterval
  minReplicaCount
  maxReplicaCount
  threshold
`;

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
  // Message-queue triggers (graphql-server-lambdas message-queue.controller)
  // --------------------------------------------------------------------

  public static listMessageQueueTriggers(projectId: string) {
    return this.query<{ listMessageQueueTriggers: MessageQueueTrigger[] }>({
      query: gql`
        query listMessageQueueTriggers($projectId: String!) {
          listMessageQueueTriggers(projectId: $projectId) {
            ${MessageQueueTriggerFragment}
          }
        }
      `,
      variables: { projectId },
    }).pipe(map((res) => res.listMessageQueueTriggers));
  }

  public static saveMessageQueueTrigger(
    mode: 'create' | 'update',
    projectId: string,
    payload: MessageQueueTriggerInput,
  ) {
    const field = `${mode}MessageQueueTrigger`;
    return this.query<Record<string, MessageQueueTrigger>>({
      query: gql`
        mutation ${field}($projectId: String!, $payload: MessageQueueTriggerInput!) {
          ${field}(projectId: $projectId, payload: $payload) {
            ${MessageQueueTriggerFragment}
          }
        }
      `,
      variables: { projectId, payload },
    }).pipe(map((res) => res[field]));
  }

  public static deleteMessageQueueTrigger(projectId: string, name: string) {
    return this.query<{ deleteMessageQueueTrigger: MessageQueueTrigger }>({
      query: gql`
        mutation deleteMessageQueueTrigger($projectId: String!, $name: String!) {
          deleteMessageQueueTrigger(projectId: $projectId, name: $name) {
            ${MessageQueueTriggerFragment}
          }
        }
      `,
      variables: { projectId, name },
    }).pipe(map((res) => res.deleteMessageQueueTrigger));
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
      withLoadBalancer?: boolean;
      controlPlanes?: number;
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
          $withLoadBalancer: Boolean
          $controlPlanes: Int
        ) {
          provisionProjectCluster(
            projectId: $projectId
            name: $name
            imageId: $imageId
            serverType: $serverType
            location: $location
            workers: $workers
            singleNode: $singleNode
            withLoadBalancer: $withLoadBalancer
            controlPlanes: $controlPlanes
          ) {
            ${ClusterFragment}
          }
        }
      `,
      variables: { projectId, ...input },
    }).pipe(map((res) => res.provisionProjectCluster));
  }

  /** A virtual cluster (vCluster) on the shared cluster or on one of the
      project's private clusters. routerUrl/hostNamespace are selected here
      only, not in ClusterFragment, so older servers keep working. */
  public static provisionProjectVirtualCluster(
    projectId: string,
    input: { name: string; hostClusterId?: string },
  ) {
    return this.query<{
      provisionProjectVirtualCluster: ICluster & {
        routerUrl?: string | null;
        hostNamespace?: string | null;
      };
    }>({
      query: gql`
        mutation provisionProjectVirtualCluster(
          $projectId: String!
          $name: String!
          $hostClusterId: String
        ) {
          provisionProjectVirtualCluster(
            projectId: $projectId
            name: $name
            hostClusterId: $hostClusterId
          ) {
            ${ClusterFragment}
            routerUrl
            hostNamespace
          }
        }
      `,
      variables: { projectId, ...input },
    }).pipe(map((res) => res.provisionProjectVirtualCluster));
  }

  public static listLocalRunners() {
    return this.query<{ listLocalRunners: LocalRunner[] }>({
      query: gql`
        query listLocalRunners {
          listLocalRunners {
            ${LocalRunnerFragment}
          }
        }
      `,
    }).pipe(map((res) => res.listLocalRunners));
  }

  public static createLocalRunner(name: string) {
    return this.query<{
      createLocalRunner: { runner: LocalRunner; token: string };
    }>({
      query: gql`
        mutation createLocalRunner($name: String!) {
          createLocalRunner(name: $name) {
            token
            runner {
              ${LocalRunnerFragment}
            }
          }
        }
      `,
      variables: { name },
    }).pipe(map((res) => res.createLocalRunner));
  }

  public static setLocalRunnerModels(
    runnerId: string,
    models: string[] | null,
  ) {
    return this.query<{ setLocalRunnerModels: LocalRunner }>({
      query: gql`
        mutation setLocalRunnerModels($runnerId: String!, $models: [String!]) {
          setLocalRunnerModels(runnerId: $runnerId, models: $models) {
            ${LocalRunnerFragment}
          }
        }
      `,
      variables: { runnerId, models },
    }).pipe(map((res) => res.setLocalRunnerModels));
  }

  public static deleteLocalRunner(runnerId: string) {
    return this.query<{ deleteLocalRunner: { status: string } }>({
      query: gql`
        mutation deleteLocalRunner($runnerId: String!) {
          deleteLocalRunner(runnerId: $runnerId) {
            status
          }
        }
      `,
      variables: { runnerId },
    }).pipe(map((res) => res.deleteLocalRunner));
  }

  public static listLocalWorkspaces(projectId?: string) {
    return this.query<{ listLocalWorkspaces: LocalWorkspace[] }>({
      query: gql`
        query listLocalWorkspaces($projectId: String) {
          listLocalWorkspaces(projectId: $projectId) {
            ${LocalWorkspaceFragment}
          }
        }
      `,
      variables: { projectId },
    }).pipe(map((res) => res.listLocalWorkspaces));
  }

  public static createLocalWorkspace(projectId: string, name: string) {
    return this.query<{
      createLocalWorkspace: { workspace: LocalWorkspace; token: string };
    }>({
      query: gql`
        mutation createLocalWorkspace($projectId: String!, $name: String!) {
          createLocalWorkspace(projectId: $projectId, name: $name) {
            token
            workspace {
              ${LocalWorkspaceFragment}
            }
          }
        }
      `,
      variables: { projectId, name },
    }).pipe(map((res) => res.createLocalWorkspace));
  }

  public static deleteLocalWorkspace(workspaceId: string) {
    return this.query<{ deleteLocalWorkspace: { status: string } }>({
      query: gql`
        mutation deleteLocalWorkspace($workspaceId: String!) {
          deleteLocalWorkspace(workspaceId: $workspaceId) {
            status
          }
        }
      `,
      variables: { workspaceId },
    }).pipe(map((res) => res.deleteLocalWorkspace));
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

  // Cluster scaling, topology, load balancer and health (cluster-provisioner;
  // the same operations as gql-fission core/services/cluster/*.graphql).
  // Mutations start a background job: the returned status is e.g.
  // "scaling"/"migrating" and settles to "ready" (or "error").

  private static clusterMutation(
    field: string,
    extraArgs: Record<string, string>,
    variables: Record<string, unknown>,
  ) {
    const defs = Object.entries(extraArgs)
      .map(([k, t]) => `$${k}: ${t}`)
      .join(' ');
    const args = Object.keys(extraArgs)
      .map((k) => `${k}: $${k}`)
      .join(' ');
    return this.query<Record<string, ClusterChange>>({
      query: gql`
        mutation ${field}($projectId: String! $clusterId: String! ${defs}) {
          ${field}(projectId: $projectId clusterId: $clusterId ${args}) {
            ${ClusterChangeFragment}
          }
        }
      `,
      variables,
    }).pipe(map((res) => res[field]));
  }

  public static scaleProjectCluster(
    projectId: string,
    clusterId: string,
    workers: number,
  ) {
    return this.clusterMutation(
      'scaleProjectCluster',
      { workers: 'Int!' },
      { projectId, clusterId, workers },
    );
  }

  public static scaleControlPlanesProjectCluster(
    projectId: string,
    clusterId: string,
    controlPlanes: number,
  ) {
    return this.clusterMutation(
      'scaleControlPlanesProjectCluster',
      { controlPlanes: 'Int!' },
      { projectId, clusterId, controlPlanes },
    );
  }

  public static migrateToMultiNodeProjectCluster(
    projectId: string,
    clusterId: string,
    workers: number,
  ) {
    return this.clusterMutation(
      'migrateToMultiNodeProjectCluster',
      { workers: 'Int!' },
      { projectId, clusterId, workers },
    );
  }

  public static revertToSingleNodeProjectCluster(
    projectId: string,
    clusterId: string,
  ) {
    return this.clusterMutation(
      'revertToSingleNodeProjectCluster',
      {},
      { projectId, clusterId },
    );
  }

  public static setProjectClusterLoadBalancer(
    projectId: string,
    clusterId: string,
    enabled: boolean,
  ) {
    return this.clusterMutation(
      enabled
        ? 'enableLoadBalancerProjectCluster'
        : 'disableLoadBalancerProjectCluster',
      {},
      { projectId, clusterId },
    );
  }

  public static updateProjectClusterAutoscale(
    projectId: string,
    clusterId: string,
    input: ClusterAutoscalePolicy,
  ) {
    return this.query<{
      updateProjectClusterAutoscale: ClusterChange & {
        autoscale: ClusterAutoscalePolicy;
      };
    }>({
      query: gql`
        mutation updateProjectClusterAutoscale(
          $projectId: String!
          $clusterId: String!
          $input: ClusterAutoscaleInput!
        ) {
          updateProjectClusterAutoscale(
            projectId: $projectId
            clusterId: $clusterId
            input: $input
          ) {
            id
            name
            status
            topology {
              workers
              singleNode
              controlPlanes
            }
            autoscale {
              ${ClusterAutoscaleFragment}
            }
          }
        }
      `,
      variables: { projectId, clusterId, input },
    }).pipe(map((res) => res.updateProjectClusterAutoscale));
  }

  /** projectClusters with the fields cluster:apply compares. */
  public static projectClustersDetailed(projectId: string) {
    return this.query<{
      projectClusters: (ClusterChange & {
        autoscale: ClusterAutoscalePolicy;
      })[];
    }>({
      query: gql`
        query projectClustersDetailed($projectId: String!) {
          projectClusters(projectId: $projectId) {
            ${ClusterChangeFragment}
            autoscale {
              ${ClusterAutoscaleFragment}
            }
          }
        }
      `,
      variables: { projectId },
    }).pipe(map((res) => res.projectClusters ?? []));
  }

  public static projectClustersOverview(projectId: string) {
    return this.query<{ projectClustersOverview: ClusterOverview[] }>({
      query: gql`
        query projectClustersOverview($projectId: String!) {
          projectClustersOverview(projectId: $projectId) {
            ${ClusterOverviewFragment}
          }
        }
      `,
      variables: { projectId },
    }).pipe(map((res) => res.projectClustersOverview ?? []));
  }

  public static clusterHealth(projectId: string, clusterId: string, limit = 1) {
    return this.query<{ clusterHealth: ClusterHealthSnapshot[] }>({
      query: gql`
        query clusterHealth(
          $projectId: String!
          $clusterId: String!
          $limit: Int
        ) {
          clusterHealth(
            projectId: $projectId
            clusterId: $clusterId
            limit: $limit
          ) {
            ${ClusterHealthFragment}
          }
        }
      `,
      variables: { projectId, clusterId, limit },
    }).pipe(map((res) => res.clusterHealth ?? []));
  }

  public static clusterScaleEvents(
    projectId: string,
    clusterId: string,
    limit = 20,
  ) {
    return this.query<{ clusterScaleEvents: ClusterScaleEvent[] }>({
      query: gql`
        query clusterScaleEvents(
          $projectId: String!
          $clusterId: String!
          $limit: Int
        ) {
          clusterScaleEvents(
            projectId: $projectId
            clusterId: $clusterId
            limit: $limit
          ) {
            ${ClusterScaleEventFragment}
          }
        }
      `,
      variables: { projectId, clusterId, limit },
    }).pipe(map((res) => res.clusterScaleEvents ?? []));
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

  // --------------------------------------------------------------------
  // Workflows (feature workflows): graphql-server-lambdas, plus the AI
  // draft from graphql-server. Ids are workflow ids; commands resolve names.
  // --------------------------------------------------------------------

  public static listWorkflows(projectId: string) {
    return this.query<{ listWorkflows: Workflow[] }>({
      query: gql`
        query listWorkflows($projectId: String!) {
          listWorkflows(projectId: $projectId) {
            ${WorkflowFragment}
          }
        }
      `,
      variables: { projectId },
    }).pipe(map((res) => res.listWorkflows ?? []));
  }

  public static validateWorkflow(
    projectId: string,
    definition: WorkflowDefinition,
    clusterId?: string,
  ) {
    return this.query<{ validateWorkflow: WorkflowValidation }>({
      query: gql`
        query validateWorkflow(
          $projectId: String!
          $definition: JSON!
          $clusterId: String
        ) {
          validateWorkflow(
            projectId: $projectId
            definition: $definition
            clusterId: $clusterId
          ) {
            valid
            clusterId
            functions
          }
        }
      `,
      variables: { projectId, definition, clusterId },
    }).pipe(map((res) => res.validateWorkflow));
  }

  public static createWorkflow(
    projectId: string,
    input: {
      name: string;
      description?: string;
      definition: WorkflowDefinition;
      clusterId?: string;
    },
  ) {
    return this.query<{ createWorkflow: Workflow }>({
      query: gql`
        mutation createWorkflow(
          $projectId: String!
          $name: String!
          $description: String
          $definition: JSON!
          $clusterId: String
        ) {
          createWorkflow(
            projectId: $projectId
            name: $name
            description: $description
            definition: $definition
            clusterId: $clusterId
          ) {
            ${WorkflowFragment}
          }
        }
      `,
      variables: { projectId, ...input },
    }).pipe(map((res) => res.createWorkflow));
  }

  public static updateWorkflow(
    projectId: string,
    workflowId: string,
    input: { description?: string; definition: WorkflowDefinition },
  ) {
    return this.query<{ updateWorkflow: Workflow }>({
      query: gql`
        mutation updateWorkflow(
          $projectId: String!
          $workflowId: String!
          $description: String
          $definition: JSON!
        ) {
          updateWorkflow(
            projectId: $projectId
            workflowId: $workflowId
            description: $description
            definition: $definition
          ) {
            ${WorkflowFragment}
          }
        }
      `,
      variables: { projectId, workflowId, ...input },
    }).pipe(map((res) => res.updateWorkflow));
  }

  public static deleteWorkflow(projectId: string, workflowId: string) {
    return this.query<{ deleteWorkflow: Workflow }>({
      query: gql`
        mutation deleteWorkflow($projectId: String!, $workflowId: String!) {
          deleteWorkflow(projectId: $projectId, workflowId: $workflowId) {
            id
            name
          }
        }
      `,
      variables: { projectId, workflowId },
    }).pipe(map((res) => res.deleteWorkflow));
  }

  public static startWorkflowRun(
    projectId: string,
    workflowId: string,
    input?: unknown,
  ) {
    return this.query<{ startWorkflowRun: WorkflowRun }>({
      query: gql`
        mutation startWorkflowRun(
          $projectId: String!
          $workflowId: String!
          $input: JSON
        ) {
          startWorkflowRun(
            projectId: $projectId
            workflowId: $workflowId
            input: $input
          ) {
            ${WorkflowRunFragment}
          }
        }
      `,
      variables: { projectId, workflowId, input },
    }).pipe(map((res) => res.startWorkflowRun));
  }

  public static listWorkflowRuns(
    projectId: string,
    workflowId: string,
    limit?: number,
  ) {
    return this.query<{ listWorkflowRuns: WorkflowRun[] }>({
      query: gql`
        query listWorkflowRuns(
          $projectId: String!
          $workflowId: String!
          $limit: Int
        ) {
          listWorkflowRuns(
            projectId: $projectId
            workflowId: $workflowId
            limit: $limit
          ) {
            ${WorkflowRunFragment}
          }
        }
      `,
      variables: { projectId, workflowId, limit },
    }).pipe(map((res) => res.listWorkflowRuns ?? []));
  }

  public static getWorkflowRun(
    projectId: string,
    workflowId: string,
    runName: string,
  ) {
    return this.query<{ getWorkflowRun: WorkflowRun }>({
      query: gql`
        query getWorkflowRun(
          $projectId: String!
          $workflowId: String!
          $runName: String!
        ) {
          getWorkflowRun(
            projectId: $projectId
            workflowId: $workflowId
            runName: $runName
          ) {
            ${WorkflowRunDetailsFragment}
          }
        }
      `,
      variables: { projectId, workflowId, runName },
    }).pipe(map((res) => res.getWorkflowRun));
  }

  public static cancelWorkflowRun(
    projectId: string,
    workflowId: string,
    runName: string,
  ) {
    return this.query<{ cancelWorkflowRun: WorkflowRun }>({
      query: gql`
        mutation cancelWorkflowRun(
          $projectId: String!
          $workflowId: String!
          $runName: String!
        ) {
          cancelWorkflowRun(
            projectId: $projectId
            workflowId: $workflowId
            runName: $runName
          ) {
            ${WorkflowRunFragment}
          }
        }
      `,
      variables: { projectId, workflowId, runName },
    }).pipe(map((res) => res.cancelWorkflowRun));
  }

  /** Add an HTTP or cron trigger that starts runs (Fission 1.26+ on the
      workflow's cluster). Returns the workflow with its triggers. */
  public static addWorkflowTrigger(
    projectId: string,
    workflowId: string,
    trigger: WorkflowTriggerInput,
  ) {
    return this.query<{ addWorkflowTrigger: Workflow }>({
      query: gql`
        mutation addWorkflowTrigger(
          $projectId: String!
          $workflowId: String!
          $trigger: WorkflowTriggerInput!
        ) {
          addWorkflowTrigger(
            projectId: $projectId
            workflowId: $workflowId
            trigger: $trigger
          ) {
            ${WorkflowFragment}
          }
        }
      `,
      variables: { projectId, workflowId, trigger },
    }).pipe(map((res) => res.addWorkflowTrigger));
  }

  public static removeWorkflowTrigger(
    projectId: string,
    workflowId: string,
    triggerId: string,
  ) {
    return this.query<{ removeWorkflowTrigger: Workflow }>({
      query: gql`
        mutation removeWorkflowTrigger(
          $projectId: String!
          $workflowId: String!
          $triggerId: String!
        ) {
          removeWorkflowTrigger(
            projectId: $projectId
            workflowId: $workflowId
            triggerId: $triggerId
          ) {
            ${WorkflowFragment}
          }
        }
      `,
      variables: { projectId, workflowId, triggerId },
    }).pipe(map((res) => res.removeWorkflowTrigger));
  }

  /** AI draft (graphql-server, MiniMax): from plain language, or a change
      to `current`. Nothing is saved. */
  public static generateWorkflowDraft(
    projectId: string,
    description: string,
    current?: WorkflowDefinition,
  ) {
    return this.query<{ generateWorkflowDraft: WorkflowDraft }>({
      query: gql`
        mutation generateWorkflowDraft(
          $projectId: String!
          $description: String!
          $current: JSON
        ) {
          generateWorkflowDraft(
            projectId: $projectId
            description: $description
            current: $current
          ) {
            definition
            explanation
            warnings
          }
        }
      `,
      variables: { projectId, description, current },
    }).pipe(map((res) => res.generateWorkflowDraft));
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
