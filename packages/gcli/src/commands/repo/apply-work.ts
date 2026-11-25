import type { Unit } from './discover';
import type { UnitPlan } from './plan';

/** What `apply` does for one unit - decided from its plan, pure. */
export interface UnitWork {
  unit: Unit;
  name: string;
  environment?: 'create' | 'update';
  /** a deploy also brings `triggers.time` and `domains:` along */
  lambda?: 'createLambda' | 'updateLambda';
  time: boolean;
  domains: boolean;
  mq: boolean;
}

const drifts = (plan: UnitPlan, test: (section: string) => boolean) =>
  plan.sections.filter(
    (s) => test(s.section) && (s.state === 'changes' || s.state === 'missing'),
  );

/**
 * One unit: the environment when it differs (only in the unit that owns
 * it), the lambda when it is missing or its settings differ (or always with
 * --code: code changes are not seen by the plan yet), then the triggers and
 * domains the deploy does not already bring.
 */
export function workFor(
  unit: Unit,
  plan: UnitPlan,
  opts: { code?: boolean } = {},
): UnitWork {
  const section = (name: string) =>
    plan.sections.find((s) => s.section === name);
  const fn = section('function');
  const env = section('environment');
  const lambda: UnitWork['lambda'] =
    fn?.state === 'missing'
      ? 'createLambda'
      : fn && (fn.state === 'changes' || opts.code)
        ? 'updateLambda'
        : undefined;
  return {
    unit,
    name: unit.spec.function?.name ?? unit.id,
    environment:
      env?.state === 'missing'
        ? 'create'
        : env?.state === 'changes'
          ? 'update'
          : undefined,
    lambda,
    time: !lambda && drifts(plan, (s) => s === 'triggers.time').length > 0,
    domains: !lambda && drifts(plan, (s) => s.startsWith('domain ')).length > 0,
    // a new lambda: its triggers can only be made now
    mq:
      drifts(plan, (s) => s.startsWith('triggers.mq ')).length > 0 ||
      (lambda === 'createLambda' && !!unit.spec.triggers?.mq?.length),
  };
}

export const hasWork = (w: UnitWork) =>
  !!(w.environment || w.lambda || w.time || w.domains || w.mq);
