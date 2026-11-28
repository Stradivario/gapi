/**
 * Plan 50 - cost optimization from the CLI: right-sizing recommendations
 * (lambdas and plugins), the per-lambda resources mode, sleep schedules,
 * saved this month, plugin volume auto-grow and the cluster's pod placement.
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

/** A named schedule lambdas follow (`scaleOptions.sleepSchedule`): outside
    its hours they scale to zero. */
export interface SleepSchedule {
  id?: string | null;
  projectId?: string | null;
  name: string;
  /** false = paused: its lambdas stay awake */
  enabled?: boolean | null;
  timezone?: string | null;
  /** the days WITH working hours, 0 = Sunday */
  days?: number[] | null;
  wakeAt?: string | null;
  sleepAt?: string | null;
  lambdas?: string[] | null;
  state?: 'awake' | 'asleep' | null;
  override?: string | null;
  overrideUntil?: string | null;
  lambdasAsleep?: number | null;
  sleptAt?: string | null;
  wokeAt?: string | null;
  error?: string | null;
}

export interface SleepScheduleInput {
  name: string;
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

const SLEEP_SCHEDULE = `id projectId name enabled timezone days wakeAt sleepAt lambdas state override overrideUntil lambdasAsleep sleptAt wokeAt error`;

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

  sleepSchedules: (projectId: string) =>
    GraphqlClienAPI.query<{ sleepSchedules: SleepSchedule[] }>({
      query: gql`
        query sleepSchedules($projectId: String!) {
          sleepSchedules(projectId: $projectId) { ${SLEEP_SCHEDULE} }
        }
      `,
      variables: { projectId },
    }).pipe(map((r) => r.sleepSchedules ?? [])),

  /** Create or change by name; applies at once. */
  saveSleepSchedule: (projectId: string, input: SleepScheduleInput) =>
    GraphqlClienAPI.query<{ saveSleepSchedule: SleepSchedule }>({
      query: gql`
        mutation saveSleepSchedule($projectId: String!, $input: SleepScheduleInput!) {
          saveSleepSchedule(projectId: $projectId, input: $input) { ${SLEEP_SCHEDULE} }
        }
      `,
      variables: { projectId, input },
    }).pipe(map((r) => r.saveSleepSchedule)),

  /** Refused (the error names them) while lambdas follow it. */
  deleteSleepSchedule: (projectId: string, name: string) =>
    GraphqlClienAPI.query<{ deleteSleepSchedule: boolean }>({
      query: gql`
        mutation deleteSleepSchedule($projectId: String!, $name: String!) {
          deleteSleepSchedule(projectId: $projectId, name: $name)
        }
      `,
      variables: { projectId, name },
    }).pipe(map((r) => r.deleteSleepSchedule)),

  sleepScheduleNow: (projectId: string, name: string) =>
    GraphqlClienAPI.query<{ sleepScheduleNow: SleepSchedule }>({
      query: gql`
        mutation sleepScheduleNow($projectId: String!, $name: String!) {
          sleepScheduleNow(projectId: $projectId, name: $name) { ${SLEEP_SCHEDULE} }
        }
      `,
      variables: { projectId, name },
    }).pipe(map((r) => r.sleepScheduleNow)),

  wakeScheduleNow: (projectId: string, name: string) =>
    GraphqlClienAPI.query<{ wakeScheduleNow: SleepSchedule }>({
      query: gql`
        mutation wakeScheduleNow($projectId: String!, $name: String!) {
          wakeScheduleNow(projectId: $projectId, name: $name) { ${SLEEP_SCHEDULE} }
        }
      `,
      variables: { projectId, name },
    }).pipe(map((r) => r.wakeScheduleNow)),

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
