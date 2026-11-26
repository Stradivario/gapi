import { defer, EMPTY, from, lastValueFrom, Observable, timer } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { errorText, humanOutputToStderr, ui } from '~/services/ui';

import {
  ClusterTargetOptions,
  resolveClusterTarget,
} from './helpers/cluster-change';
import { healthView } from './helpers/health-view';
import { ClusterHealthSnapshot, ClusterOverview } from './types';

export interface ClusterHealthOptions extends ClusterTargetOptions {
  /** true (flag alone) = every 30 s, or a number of seconds */
  watch?: boolean | string;
  json?: boolean;
}

interface HealthData {
  overview: ClusterOverview | null;
  latest: ClusterHealthSnapshot | null;
}

/** The agent reports every 30 s - refreshing faster shows the same data. */
const DEFAULT_WATCH_SECONDS = 30;
const MIN_WATCH_SECONDS = 5;

export const watchSeconds = (watch: ClusterHealthOptions['watch']) => {
  if (!watch) return 0;
  const seconds = watch === true ? DEFAULT_WATCH_SECONDS : Number(watch);
  if (!Number.isFinite(seconds) || seconds < MIN_WATCH_SECONDS) {
    throw new Error(
      `--watch takes a number of seconds, at least ${MIN_WATCH_SECONDS}`,
    );
  }
  return seconds;
};

const render = (data: HealthData, clusterId: string, now: Date) =>
  data.overview
    ? healthView(data.overview, data.latest, now)
    : [
        ui.dim(
          `No cluster ${clusterId} in this project (see gcli cluster:list).`,
        ),
      ];

/** gcli cluster:health --cluster <id> [--watch [seconds]] [--json] - the
    cluster's health as a terminal dashboard: meters of what it may use,
    nodes, issues. One request; --watch redraws it until Ctrl+C. */
export default (cmd: ClusterHealthOptions) => {
  if (cmd.json) humanOutputToStderr();
  const seconds = watchSeconds(cmd.watch);
  const flow: Observable<HealthData> = defer(() =>
    from(resolveClusterTarget(cmd)),
  ).pipe(
    switchMap(({ projectId, clusterId }) => {
      const fetch = () =>
        GraphqlClienAPI.clusterHealthView(projectId, clusterId);
      const show = (data: HealthData) => {
        if (cmd.json) {
          process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
          return;
        }
        const lines = render(data, clusterId, new Date());
        if (seconds) {
          ui.redraw([
            ...lines,
            '',
            ui.dim(`Refreshing every ${seconds}s - Ctrl+C to stop`),
          ]);
        } else {
          ui.print(['', ...lines, ''].join('\n'));
        }
      };
      // --watch keeps going through a failed refresh (network, gateway
      // restart): it says so and the next tick tries again
      return seconds
        ? timer(0, seconds * 1000).pipe(
            switchMap(() =>
              fetch().pipe(
                tap(show),
                catchError((error) => {
                  ui.warn(`refresh failed: ${errorText(error)}`, 'health');
                  return EMPTY;
                }),
              ),
            ),
          )
        : fetch().pipe(tap(show));
    }),
  );
  return lastValueFrom(flow);
};
