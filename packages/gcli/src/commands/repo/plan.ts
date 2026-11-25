import { forkJoin, lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { domainStep } from '~/commands/domain/plan';
import { timeTriggerPlan } from '~/commands/lambda/helpers/time-trigger-sync';
import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI, ProjectDomain } from '~/services/gql-client';
import { ui } from '~/services/ui';

import { discover, repoRoot, Unit, unitKey } from './discover';
import {
  Change,
  environmentChanges,
  functionChanges,
  Loose,
  stateOf,
  UnitState,
} from './drift';
import { renderPlan, unitNames } from './plan-view';

/** What runs in the project - read once for the whole repository. */
interface Live {
  lambdas: Loose[];
  environments: Loose[];
  timeTriggers: Loose[];
  mqTriggers: Loose[];
  domains: ProjectDomain[];
}

/** One section of one unit. */
export interface SectionPlan {
  section: string;
  state: UnitState | 'error';
  changes: Change[];
  note?: string;
}

export interface UnitPlan {
  unit: string;
  sections: SectionPlan[];
}

const LIVE_FIELDS = [
  'requestTopic',
  'responseTopic',
  'errorTopic',
  'lambdaName',
];

/** The plan of one unit against what runs - pure, so it is tested alone. */
export function planUnit(unit: Unit, live: Live): UnitPlan {
  const sections: SectionPlan[] = [];
  const fn = unit.spec.function;
  const lambda = fn?.name
    ? (live.lambdas.find(
        (l) =>
          l.name === fn.name &&
          (fn.clusterId
            ? l.clusterId === fn.clusterId
            : fn.clusterName
              ? !!l.clusterId
              : !l.clusterId),
      ) ?? live.lambdas.find((l) => l.name === fn.name))
    : undefined;

  if (fn?.name) {
    const changes = lambda ? functionChanges(fn, lambda) : [];
    sections.push({
      section: 'function',
      state: stateOf(!!lambda, changes),
      changes,
    });
  }

  const env = unit.spec.environment;
  if (env?.name && unit.own.environment) {
    const liveEnv = live.environments.find((e) => e.name === env.name);
    const changes = liveEnv ? environmentChanges(env, liveEnv) : [];
    sections.push({
      section: 'environment',
      state: stateOf(!!liveEnv, changes),
      changes,
    });
  }

  const time = unit.spec.triggers?.time;
  if (time && fn?.name) {
    const existing = lambda
      ? live.timeTriggers.find((t) => t.lambdaId === lambda.id)
      : undefined;
    const step = timeTriggerPlan(fn.name, time, existing);
    sections.push({
      section: 'triggers.time',
      state:
        step === 'same' ? 'in-sync' : step === 'create' ? 'missing' : 'changes',
      changes:
        step === 'replace'
          ? [{ field: 'cron', now: existing?.cron, wanted: time.cron }]
          : [],
    });
  }

  for (const mq of unit.spec.triggers?.mq ?? []) {
    const existing = live.mqTriggers.find((t) => t.name === mq.name);
    const wanted: Record<string, unknown> = {
      requestTopic: mq.requestTopic,
      responseTopic: mq.responseTopic,
      errorTopic: mq.errorTopic,
      lambdaName: mq.lambda ?? fn?.name,
    };
    const changes = existing
      ? LIVE_FIELDS.filter(
          (f) =>
            wanted[f] !== undefined &&
            String(existing[f] ?? '') !== String(wanted[f]),
        ).map((field) => ({
          field,
          now: existing[field],
          wanted: wanted[field],
        }))
      : [];
    sections.push({
      section: `triggers.mq ${mq.name}`,
      state: stateOf(!!existing, changes),
      changes,
    });
  }

  const lambdaIds = new Map(
    live.lambdas.map((l) => [l.name as string, l.id as string]),
  );
  for (const entry of unit.spec.domains ?? []) {
    const label = entry?.name ?? entry?.host ?? '?';
    try {
      const step = domainStep(entry, live.domains, lambdaIds, fn?.name);
      sections.push({
        section: `domain ${label}`,
        state: step.create ? 'missing' : step.same ? 'in-sync' : 'changes',
        changes:
          step.same || step.create
            ? []
            : [
                {
                  field: 'routing',
                  now: step.existing?.routeMode,
                  wanted: step.routing.routeMode,
                },
              ],
      });
    } catch (e) {
      sections.push({
        section: `domain ${label}`,
        state: 'error',
        changes: [],
        note: (e as Error).message,
      });
    }
  }
  return { unit: unitKey(unit), sections };
}

/** Lambdas of the project no file of this repository declares. */
export const unmanaged = (units: Unit[], live: Live) => {
  const declared = new Set(
    units.map((u) => u.spec.function?.name).filter(Boolean),
  );
  return live.lambdas
    .filter((l) => !declared.has(l.name))
    .map((l) => l.name as string);
};

export const loadLive = (projectId: string) =>
  forkJoin({
    lambdas: GraphqlClienAPI.listLambdasForPlan(projectId),
    environments: GraphqlClienAPI.listEnvironments(projectId).pipe(
      map((e) => (e ?? []) as Loose[]),
    ),
    timeTriggers: GraphqlClienAPI.listProjectTimeTriggers(projectId).pipe(
      map((t) => (t ?? []) as Loose[]),
      catchError(() => of([])),
    ),
    mqTriggers: GraphqlClienAPI.listMessageQueueTriggers(projectId).pipe(
      map((t) => (t ?? []) as Loose[]),
      catchError(() => of([])),
    ),
    domains: GraphqlClienAPI.listProjectDomains(projectId).pipe(
      catchError(() => of([] as ProjectDomain[])),
    ),
  });

/**
 * gcli plan [path] - every lambforge.yaml of the repository against what
 * runs in the project: in sync (v), will change (~), missing (+), error (x);
 * then the project's unmanaged lambdas (reported, never touched).
 * --exit-code: 0 in sync, 2 drift, 1 error. --json for CI.
 */
export default (
  path: string | undefined,
  cmd: { project?: string; exitCode?: boolean; json?: boolean },
) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) => {
        const units = discover(repoRoot(path ?? process.cwd())).filter(
          (u) => !u.error,
        );
        return loadLive(projectId).pipe(
          map((live) => ({
            units,
            live,
            plans: units.map((u) => planUnit(u, live)),
          })),
        );
      }),
      tap(({ units, live, plans }) => {
        const rest = unmanaged(units, live);
        const all = plans.flatMap((p) => p.sections);
        const errors = all.filter((s) => s.state === 'error').length;
        const drift = all.filter(
          (s) => s.state === 'changes' || s.state === 'missing',
        ).length;
        if (cmd.json) {
          process.stdout.write(
            `${JSON.stringify({ plans, unmanaged: rest, errors, drift }, null, 2)}
`,
          );
        } else {
          renderPlan(plans, rest, unitNames(units));
          ui.print(
            `\n${all.length - drift - errors} in sync, ${drift} to change, ${errors} error(s)${drift ? ui.dim(' - gcli apply makes the changes') : ''}`,
          );
        }
        if (cmd.exitCode) process.exitCode = errors ? 1 : drift ? 2 : 0;
      }),
    ),
  );
