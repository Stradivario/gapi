import {
  concat,
  defer,
  EMPTY,
  lastValueFrom,
  Observable,
  of,
  throwError,
} from 'rxjs';
import {
  catchError,
  finalize,
  map,
  switchMap,
  tap,
  toArray,
} from 'rxjs/operators';

import { applyDomains } from '~/commands/domain/apply';
import { environmentPayload } from '~/commands/environment/environment-payload';
import {
  createOrUpdateLambda,
  CreateOrUpdateLambdaArguments,
} from '~/commands/lambda/helpers';
import { syncTimeTrigger } from '~/commands/lambda/helpers/time-trigger-sync';
import { applyMqTriggers } from '~/commands/triggers/message-queue/apply';
import { parseProjectId, ReportedError, resolveClusterId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { elapsed, errorText, step, ui } from '~/services/ui';

import { hasWork, unitFolder, UnitWork, workFor } from './apply-work';
import { discover, repoRoot, Unit } from './discover';
import { Loose } from './drift';
import { loadLive, planUnit, unmanaged } from './plan';
import { countPlan, renderPlan, unitNames } from './plan-view';

/** Runs `work$` inside the unit's folder (a deploy reads build.sh,
    .gignore and the files next to its lambforge.yaml), then back. */
const inFolder = <T>(unit: Unit, root: string, work$: () => Observable<T>) =>
  defer(() => {
    const back = process.cwd();
    // discover() gives an absolute file; resolve() keeps it, and still
    // places a relative one under the root
    process.chdir(unitFolder(root, unit));
    return work$().pipe(finalize(() => process.chdir(back)));
  });

const environmentStep = (projectId: string, w: UnitWork) => {
  const env = w.unit.spec.environment as Loose;
  const { clusterName, ...data } = env;
  return resolveClusterId(projectId, {
    clusterId: data.clusterId as string,
    clusterName: clusterName as string,
  }).pipe(
    switchMap((clusterId) => {
      const payload = { ...environmentPayload(data as never, {}), clusterId };
      return w.environment === 'create'
        ? GraphqlClienAPI.createEnvironment(projectId, payload as never)
        : GraphqlClienAPI.updateEnvironment(projectId, payload as never);
    }),
    step(`${w.environment === 'create' ? 'creating' : 'updating'}`, {
      scope: `environment[${env.name}]`,
      done: () => (w.environment === 'create' ? 'created' : 'updated'),
    }),
  );
};

const lambdaStep = (projectId: string, w: UnitWork) =>
  defer(() =>
    createOrUpdateLambda(
      {
        project: projectId,
        embedded: true,
      } as CreateOrUpdateLambdaArguments,
      w.lambda,
    ),
  );

/** Triggers and domains of a lambda that was not deployed this time. */
const extrasStep = (projectId: string, w: UnitWork) => {
  const spec = w.unit.spec;
  const name = spec.function?.name as string;
  const lambda$ =
    w.time || w.domains
      ? GraphqlClienAPI.listLambdas(projectId).pipe(
          map((all) => (all ?? []).find((l) => l.name === name)),
        )
      : of(null);
  return lambda$.pipe(
    switchMap((lambda) =>
      concat(
        w.time && lambda
          ? syncTimeTrigger(projectId, lambda, spec.triggers?.time)
          : EMPTY,
        w.domains
          ? applyDomains(projectId, spec.domains ?? [], name).pipe(
              step('applying', { scope: 'domains', done: () => 'applied' }),
            )
          : EMPTY,
        w.mq
          ? applyMqTriggers(projectId, spec as never).pipe(
              step('saving', {
                scope: `triggers.mq[${name}]`,
                done: (r) =>
                  r
                    .map(
                      (x) =>
                        `${x.saved.name} ${x.mode === 'create' ? 'created' : 'updated'}`,
                    )
                    .join(', '),
              }),
            )
          : EMPTY,
      ),
    ),
    toArray(),
  );
};

/**
 * gcli apply [path] - `gcli plan`, then makes it true: environments first,
 * then every lambda that is missing or differs (each waits for its build),
 * then the triggers and domains a deploy did not bring. Asks first on a
 * terminal (--yes for CI); never deletes; stops at the first failure.
 */
export default (
  path: string | undefined,
  cmd: { project?: string; yes?: boolean; code?: boolean; only?: string },
) => {
  const started = Date.now();
  const root = repoRoot(path ?? process.cwd());
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.getProject(projectId).pipe(
          catchError(() => of(null)),
          map((project) => ({ projectId, project })),
        ),
      ),
      switchMap(({ projectId, project }) => {
        const units = discover(root).filter(
          (u) =>
            !u.error &&
            (!cmd.only ||
              u.spec.function?.name === cmd.only ||
              u.id === cmd.only),
        );
        if (!units.length) {
          return throwError(
            () =>
              new Error(
                cmd.only
                  ? `no lambforge.yaml here declares ${cmd.only}`
                  : `no lambforge.yaml found under ${root}`,
              ),
          );
        }
        ui.header(
          `Plan for project ${project?.name || projectId} (${units.length} lambforge.yaml)`,
        );
        return loadLive(projectId).pipe(
          step('reading the project', {
            done: (live) =>
              `read ${live.lambdas.length} lambdas, ${live.environments.length} environments`,
          }),
          map((live) => {
            const plans = units.map((u) => planUnit(u, live));
            const names = unitNames(units);
            ui.print('');
            renderPlan(plans, cmd.only ? [] : unmanaged(units, live), names);
            return {
              projectId,
              plans,
              work: units.map((u, i) => workFor(u, plans[i], cmd)),
            };
          }),
        );
      }),
      switchMap(({ projectId, plans, work }) => {
        const { errors } = countPlan(plans);
        const todo = work.filter(hasWork);
        if (errors) {
          ui.error(
            `${errors} error(s) in the plan - fix them, nothing was applied`,
          );
          return throwError(() => new ReportedError('plan has errors'));
        }
        if (!todo.length) {
          ui.done('Everything is in sync - nothing to apply');
          return of(null);
        }
        const lambdas = todo.filter((w) => w.lambda).length;
        const question = `Apply changes to ${todo.length} lambforge.yaml (${lambdas} deploy${lambdas === 1 ? '' : 's'})?`;
        ui.print('');
        return (cmd.yes ? of(true) : ui.confirm(question)).pipe(
          switchMap((yes) => {
            if (!yes) {
              ui.warn('Cancelled - nothing was changed');
              return of(null);
            }
            ui.header('Applying');
            // environments first: lambdas name them
            const environments = todo
              .filter((w) => w.environment)
              .map((w) => environmentStep(projectId, w));
            const units = todo.map((w) =>
              inFolder(w.unit, root, () =>
                concat(
                  w.lambda ? lambdaStep(projectId, w) : EMPTY,
                  extrasStep(projectId, w),
                ).pipe(toArray()),
              ),
            );
            return concat(...environments, ...units).pipe(
              toArray(),
              tap(() =>
                ui.done(
                  `Apply complete! ${todo.length} applied ${ui.dim(elapsed(Date.now() - started))}`,
                ),
              ),
              catchError((e) => {
                if (!(e instanceof ReportedError)) ui.error(errorText(e));
                ui.print(
                  ui.dim(
                    '\n   Stopped at the first failure - what ran before it stays applied. Fix it and run gcli apply again.',
                  ),
                );
                return throwError(() => new ReportedError('apply failed'));
              }),
            );
          }),
        );
      }),
    ),
  );
};
