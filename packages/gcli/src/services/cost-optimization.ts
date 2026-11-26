/**
 * Plan 50 - cost optimization from the CLI: right-sizing recommendations
 * (lambdas and plugins), the per-lambda resources mode, hibernation, saved
 * this month, plugin volume auto-grow and the cluster's pod placement.
 */
import { map } from 'rxjs/operators';

import { gql, GraphqlClienAPI } from './gql-client';

const PART = `current recommended action typical peak note`;

export interface RecommendationPart {
  current: number;
  recommended: number;
  action: 'raise' | 'lower' | 'keep';
  typical: number;
  peak: number;
  note?: string | null;
}

export interface LambdaRecommendation {
  lambdaId: string;
  lambdaName: string;
  clusterId?: string | null;
  mode?: 'fixed' | 'auto' | null;
  cpu: RecommendationPart;
  memory: RecommendationPart;
  monthlyCostNow: number;
  monthlyCostRecommended: number;
  currency: string;
  confident: boolean;
  hours: number;
}

export interface PluginRecommendation {
  pluginName: string;
  clusterId?: string | null;
  cpu: RecommendationPart;
  memory: RecommendationPart;
  monthlyCostNow: number;
  monthlyCostRecommended: number;
  currency: string;
  confident: boolean;
  hours: number;
}

export interface ProjectHibernation {
  enabled: boolean;
  timezone: string;
  days: number[];
  wakeAt: string;
  sleepAt: string;
  state: 'awake' | 'asleep';
  override?: string | null;
  overrideUntil?: string | null;
  lambdasAsleep?: number | null;
  error?: string | null;
}

export interface HibernationInput {
  enabled?: boolean;
  timezone?: string;
  days?: number[];
  wakeAt?: string;
  sleepAt?: string;
}

export interface ProjectSavings {
  currency: string;
  total: number;
  ongoingMonthly: number;
  items: Array<{
    kind: string;
    label: string;
    amount: number;
    monthly: number;
    ongoing: boolean;
  }>;
}

const HIBERNATION = `enabled timezone days wakeAt sleepAt state override overrideUntil lambdasAsleep error`;

export const CostAPI = {
  lambdaRecommendations: (projectId: string, days?: number) =>
    GraphqlClienAPI.query<{
      lambdaResourceRecommendations: LambdaRecommendation[];
    }>({
      query: gql`
        query lambdaResourceRecommendations($projectId: String!, $days: Int) {
          lambdaResourceRecommendations(projectId: $projectId, days: $days) {
            lambdaId lambdaName clusterId mode
            cpu { ${PART} } memory { ${PART} }
            monthlyCostNow monthlyCostRecommended currency confident hours
          }
        }
      `,
      variables: { projectId, days },
    }).pipe(map((r) => r.lambdaResourceRecommendations ?? [])),

  pluginRecommendations: (projectId: string, days?: number) =>
    GraphqlClienAPI.query<{
      pluginResourceRecommendations: PluginRecommendation[];
    }>({
      query: gql`
        query pluginResourceRecommendations($projectId: String!, $days: Int) {
          pluginResourceRecommendations(projectId: $projectId, days: $days) {
            pluginName clusterId
            cpu { ${PART} } memory { ${PART} }
            monthlyCostNow monthlyCostRecommended currency confident hours
          }
        }
      `,
      variables: { projectId, days },
    }).pipe(map((r) => r.pluginResourceRecommendations ?? [])),

  setLambdaResourcesMode: (
    projectId: string,
    lambdaId: string,
    mode: 'fixed' | 'auto',
  ) =>
    GraphqlClienAPI.query<{ setLambdaResourcesMode: string }>({
      query: gql`
        mutation setLambdaResourcesMode(
          $projectId: String!
          $lambdaId: String!
          $mode: String!
        ) {
          setLambdaResourcesMode(
            projectId: $projectId
            lambdaId: $lambdaId
            mode: $mode
          )
        }
      `,
      variables: { projectId, lambdaId, mode },
    }).pipe(map((r) => r.setLambdaResourcesMode)),

  updatePluginSettings: (
    projectId: string,
    pluginName: string,
    clusterId: string | undefined,
    change: {
      resources?: {
        minCpu: number;
        maxCpu: number;
        minMemory: number;
        maxMemory: number;
      };
      autoGrowStorage?: boolean;
    },
  ) =>
    GraphqlClienAPI.query<{
      updatePluginSettings: {
        resources?: Record<string, number> | null;
        autoGrowStorage?: boolean | null;
      };
    }>({
      query: gql`
        mutation updatePluginSettings(
          $projectId: String!
          $pluginName: String!
          $clusterId: String
          $resources: PluginResourcesInput
          $autoGrowStorage: Boolean
        ) {
          updatePluginSettings(
            projectId: $projectId
            pluginName: $pluginName
            clusterId: $clusterId
            resources: $resources
            autoGrowStorage: $autoGrowStorage
          ) {
            resources {
              minCpu
              maxCpu
              minMemory
              maxMemory
            }
            autoGrowStorage
          }
        }
      `,
      variables: { projectId, pluginName, clusterId, ...change },
    }).pipe(map((r) => r.updatePluginSettings)),

  installedPluginResources: (projectId: string) =>
    GraphqlClienAPI.query<{
      listInstalledPlugins: Array<{
        plugin?: { name?: string | null } | null;
        clusterId?: string | null;
        resources?: {
          minCpu?: number | null;
          maxCpu?: number | null;
          minMemory?: number | null;
          maxMemory?: number | null;
        } | null;
      }>;
    }>({
      query: gql`
        query installedPluginResources($projectId: String!) {
          listInstalledPlugins(projectId: $projectId) {
            plugin {
              name
            }
            clusterId
            resources {
              minCpu
              maxCpu
              minMemory
              maxMemory
            }
          }
        }
      `,
      variables: { projectId },
    }).pipe(map((r) => r.listInstalledPlugins ?? [])),

  hibernation: (projectId: string) =>
    GraphqlClienAPI.query<{ projectHibernation: ProjectHibernation }>({
      query: gql`
        query projectHibernation($projectId: String!) {
          projectHibernation(projectId: $projectId) { ${HIBERNATION} }
        }
      `,
      variables: { projectId },
    }).pipe(map((r) => r.projectHibernation)),

  setHibernation: (projectId: string, input: HibernationInput) =>
    GraphqlClienAPI.query<{ setProjectHibernation: ProjectHibernation }>({
      query: gql`
        mutation setProjectHibernation($projectId: String!, $input: ProjectHibernationInput!) {
          setProjectHibernation(projectId: $projectId, input: $input) { ${HIBERNATION} }
        }
      `,
      variables: { projectId, input },
    }).pipe(map((r) => r.setProjectHibernation)),

  hibernateNow: (projectId: string) =>
    GraphqlClienAPI.query<{ hibernateProjectNow: ProjectHibernation }>({
      query: gql`
        mutation hibernateProjectNow($projectId: String!) {
          hibernateProjectNow(projectId: $projectId) { ${HIBERNATION} }
        }
      `,
      variables: { projectId },
    }).pipe(map((r) => r.hibernateProjectNow)),

  wakeNow: (projectId: string) =>
    GraphqlClienAPI.query<{ wakeProjectNow: ProjectHibernation }>({
      query: gql`
        mutation wakeProjectNow($projectId: String!) {
          wakeProjectNow(projectId: $projectId) { ${HIBERNATION} }
        }
      `,
      variables: { projectId },
    }).pipe(map((r) => r.wakeProjectNow)),

  savings: (projectId: string) =>
    GraphqlClienAPI.query<{ projectSavings: ProjectSavings }>({
      query: gql`
        query projectSavings($projectId: String!) {
          projectSavings(projectId: $projectId) {
            currency
            total
            ongoingMonthly
            items {
              kind
              label
              amount
              monthly
              ongoing
            }
          }
        }
      `,
      variables: { projectId },
    }).pipe(map((r) => r.projectSavings)),

  setPodPlacement: (
    projectId: string,
    clusterId: string,
    placement: 'spread' | 'fill',
  ) =>
    GraphqlClienAPI.query<{
      setProjectClusterPodPlacement: {
        id: string;
        name: string;
        status: string;
        podPlacement?: string | null;
        podPlacementJob?: string | null;
        podPlacementError?: string | null;
      };
    }>({
      query: gql`
        mutation setProjectClusterPodPlacement(
          $projectId: String!
          $clusterId: String!
          $placement: String!
        ) {
          setProjectClusterPodPlacement(
            projectId: $projectId
            clusterId: $clusterId
            placement: $placement
          ) {
            id
            name
            status
            podPlacement
            podPlacementJob
            podPlacementError
          }
        }
      `,
      variables: { projectId, clusterId, placement },
    }).pipe(map((r) => r.setProjectClusterPodPlacement)),
};
