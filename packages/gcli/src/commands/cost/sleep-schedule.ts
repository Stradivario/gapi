import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { CostAPI, SleepSchedule } from '~/services/cost-optimization';
import { ui } from '~/services/ui';

import {
  checkScheduleName,
  SleepScheduleOptions,
  sleepScheduleRow,
  toSleepScheduleInput,
} from './parse';

type Common = { project?: string; json?: boolean };

const SCOPE = 'sleep-schedule';

const show = (json?: boolean) => (s: SleepSchedule | SleepSchedule[]) =>
  json
    ? ui.print(JSON.stringify(s, null, 2))
    : ui.table((Array.isArray(s) ? s : [s]).map(sleepScheduleRow));

/** gcli sleep-schedule:list */
export default (cmd: Common) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) => CostAPI.sleepSchedules(projectId)),
      tap(show(cmd.json)),
    ),
  );

/** gcli sleep-schedule:set <name> [--days] [--wake] [--sleep] [--timezone] [--pause|--resume] */
export const set = (name: string, cmd: SleepScheduleOptions & Common) => {
  const input = toSleepScheduleInput(name, cmd);
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) => CostAPI.saveSleepSchedule(projectId, input)),
      tap((s) => {
        if (!cmd.json) ui.success(`${s.name} saved`, SCOPE);
      }),
      tap(show(cmd.json)),
    ),
  );
};

/** gcli sleep-schedule:delete <name> - refused while lambdas follow it */
export const remove = (name: string, cmd: Common) => {
  const scheduleName = checkScheduleName(name);
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        CostAPI.deleteSleepSchedule(projectId, scheduleName),
      ),
      tap((deleted) =>
        cmd.json
          ? ui.print(JSON.stringify({ name: scheduleName, deleted }))
          : deleted
            ? ui.success(`${scheduleName} deleted`, SCOPE)
            : ui.warn(`${scheduleName} was not deleted`, SCOPE),
      ),
    ),
  );
};

/** gcli sleep-schedule:sleep <name> - its lambdas asleep until the next wake time */
export const sleepNow = (name: string, cmd: Common) => {
  const scheduleName = checkScheduleName(name);
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        CostAPI.sleepScheduleNow(projectId, scheduleName),
      ),
      tap((s) => {
        if (!cmd.json)
          ui.success(
            `${s.name} asleep until ${s.overrideUntil ?? 'the next wake time'}`,
            SCOPE,
          );
      }),
      tap(show(cmd.json)),
    ),
  );
};

/** gcli sleep-schedule:wake <name> - its lambdas awake until the next sleep time */
export const wakeNow = (name: string, cmd: Common) => {
  const scheduleName = checkScheduleName(name);
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        CostAPI.wakeScheduleNow(projectId, scheduleName),
      ),
      tap((s) => {
        if (!cmd.json)
          ui.success(
            `${s.name} awake until ${s.overrideUntil ?? 'the next sleep time'}`,
            SCOPE,
          );
      }),
      tap(show(cmd.json)),
    ),
  );
};
