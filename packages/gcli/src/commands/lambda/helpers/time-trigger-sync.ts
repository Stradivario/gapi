import { concat, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

export interface DesiredTimeTrigger {
  triggerName?: string;
  cron?: string;
}

export interface ExistingTimeTrigger {
  triggerName?: string | null;
  cron?: string | null;
  lambdaId?: string | null;
}

export type TimeTriggerPlan = 'none' | 'same' | 'create' | 'replace';

/** The server stores a trigger as `<lambda>-<triggerName>`. */
export const storedTriggerName = (lambdaName: string, triggerName: string) =>
  `${lambdaName}-${triggerName}`;

/**
 * What `triggers.time` of lambforge.yaml asks for. A lambda has at most ONE
 * time trigger (the platform refuses a second), so a different name or
 * schedule means replace. No `triggers.time` in the file = leave whatever
 * exists alone (deploys never delete a trigger the file does not mention).
 */
export function timeTriggerPlan(
  lambdaName: string,
  desired: DesiredTimeTrigger | undefined | null,
  existing: ExistingTimeTrigger | undefined | null,
): TimeTriggerPlan {
  if (!desired?.triggerName || !desired?.cron) {
    return 'none';
  }
  if (!existing) {
    return 'create';
  }
  const sameName =
    existing.triggerName ===
      storedTriggerName(lambdaName, desired.triggerName) ||
    existing.triggerName === desired.triggerName;
  return sameName && existing.cron?.trim() === desired.cron.trim()
    ? 'same'
    : 'replace';
}

/**
 * Brings the lambda's time trigger to `triggers.time` after lambda:create /
 * lambda:update. A failure is reported, never fails the deploy itself.
 */
export const syncTimeTrigger = (
  projectId: string,
  lambda: { id?: string | null; name?: string | null },
  desired: DesiredTimeTrigger | undefined | null,
): Observable<TimeTriggerPlan> => {
  if (!desired?.triggerName || !desired?.cron || !lambda?.id || !lambda.name) {
    return of('none' as TimeTriggerPlan);
  }
  const lambdaId = lambda.id;
  const lambdaName = lambda.name;
  const create = () =>
    GraphqlClienAPI.createTimeTrigger({
      lambdaId,
      triggerName: desired.triggerName,
      cron: desired.cron,
    });
  return GraphqlClienAPI.listProjectTimeTriggers(projectId).pipe(
    map((all) => (all ?? []).find((t) => t.lambdaId === lambdaId)),
    switchMap((existing) => {
      const plan = timeTriggerPlan(lambdaName, desired, existing);
      const run =
        plan === 'create'
          ? create()
          : plan === 'replace'
            ? concat(
                GraphqlClienAPI.deleteLambdaTimeTrigger(lambdaId),
                create(),
              )
            : of(null);
      return run.pipe(
        map(() => plan),
        tap((done) => {
          const label = `${storedTriggerName(lambdaName, desired.triggerName)} (${desired.cron})`;
          const text: Record<TimeTriggerPlan, string> = {
            none: '',
            same: `Time trigger ${label} is up to date`,
            create: `Time trigger ${label} created`,
            replace: `Time trigger ${existing?.triggerName} (${existing?.cron}) replaced by ${label}`,
          };
          if (text[done]) Logger.info(text[done]);
        }),
      );
    }),
    catchError((e) => {
      Logger.error(
        `triggers.time was not applied: ${(e as Error)?.message ?? e} - run gcli cron:create`,
      );
      return of('none' as TimeTriggerPlan);
    }),
  );
};
