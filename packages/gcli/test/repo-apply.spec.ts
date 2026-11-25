import { hasWork, workFor } from '~/commands/repo/apply-work';
import type { UnitPlan } from '~/commands/repo/plan';

/** Feature repo-plan: what `gcli apply` does for one lambforge.yaml,
    decided from its plan. */
const unit = (spec: object, own: object = spec) =>
  ({
    id: 'packages/api',
    file: 'packages/api/lambforge.yaml',
    own,
    spec,
  }) as never;

const plan = (sections: [string, UnitPlan['sections'][0]['state']][]) =>
  ({
    unit: 'packages/api',
    sections: sections.map(([section, state]) => ({
      section,
      state,
      changes: [],
    })),
  }) as UnitPlan;

describe('gcli apply - work per lambforge.yaml', () => {
  const spec = {
    function: { name: 'api' },
    triggers: { mq: [{ name: 'jobs', requestTopic: 'jobs' }] },
  };

  it('in sync = nothing to do', () => {
    const w = workFor(unit(spec), plan([['function', 'in-sync']]));
    expect(hasWork(w)).toBe(false);
  });

  it('a missing lambda is created, with its queue triggers', () => {
    const w = workFor(unit(spec), plan([['function', 'missing']]));
    expect(w).toMatchObject({ lambda: 'createLambda', mq: true, time: false });
  });

  it('changed settings = update; the deploy brings time trigger and domains', () => {
    const w = workFor(
      unit(spec),
      plan([
        ['function', 'changes'],
        ['triggers.time', 'changes'],
        ['domain shop.example.com', 'missing'],
      ]),
    );
    expect(w).toMatchObject({
      lambda: 'updateLambda',
      time: false,
      domains: false,
    });
  });

  it('only a trigger or domain drifted: no deploy, just those', () => {
    const w = workFor(
      unit(spec),
      plan([
        ['function', 'in-sync'],
        ['triggers.time', 'changes'],
        ['domain shop.example.com', 'missing'],
        ['triggers.mq jobs', 'in-sync'],
      ]),
    );
    expect(w).toMatchObject({
      lambda: undefined,
      time: true,
      domains: true,
      mq: false,
    });
  });

  it('--code redeploys a lambda in sync (code drift is not detected yet)', () => {
    const w = workFor(unit(spec), plan([['function', 'in-sync']]), {
      code: true,
    });
    expect(w.lambda).toBe('updateLambda');
  });

  it('environment: created when missing, updated when it differs', () => {
    const env = { ...spec, environment: { name: 'node' } };
    expect(
      workFor(unit(env), plan([['environment', 'missing']])).environment,
    ).toBe('create');
    expect(
      workFor(unit(env), plan([['environment', 'changes']])).environment,
    ).toBe('update');
  });
});
