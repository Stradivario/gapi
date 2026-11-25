import {
  loadYaml,
  switchVariables,
} from '~/commands/lambda/helpers/yaml-schema';
import { buildCommand } from '~/commands/repo/apply-work';
import {
  unitKey,
  unitsOfFile,
  variantCombinations,
} from '~/commands/repo/discover';

/** Feature repo-plan: one lambforge.yaml, several lambdas (`!switch` on a
    variable) - cluster-provisioner + cluster-worker, graphql-server +
    graphql-server-subscriptions (2026-11-25: plan saw only the default
    one, the other was "unmanaged"). */
const FILE = `
.mode: &mode { var: CLUSTER_MODE, default: provisioner }
function:
  name: !switch
    <<: *mode
    cases: { provisioner: cluster-provisioner, worker: cluster-worker }
  env: !switch
    <<: *mode
    cases: { provisioner: cluster-ops, worker: cluster-worker }
  route: shared
`;

describe('lambforge.yaml variants', () => {
  it('finds every switch variable with its cases', () => {
    expect(switchVariables(FILE)).toEqual({
      CLUSTER_MODE: ['provisioner', 'worker'],
    });
  });

  it('evaluates with the given variables, not only process.env', () => {
    expect(
      loadYaml<{ function: { name: string } }>(FILE, { CLUSTER_MODE: 'worker' })
        .function.name,
    ).toBe('cluster-worker');
    expect(
      loadYaml<{ function: { name: string } }>(FILE, {}).function.name,
    ).toBe('cluster-provisioner');
  });

  it('one unit per variant that makes a different lambda', () => {
    const units = unitsOfFile(
      'packages/cp',
      '/r/packages/cp/lambforge.yaml',
      FILE,
    );
    expect(
      units.map((u) => [unitKey(u), u.spec.function.name, u.vars]),
    ).toEqual([
      [
        'packages/cp (CLUSTER_MODE=provisioner)',
        'cluster-provisioner',
        { CLUSTER_MODE: 'provisioner' },
      ],
      [
        'packages/cp (CLUSTER_MODE=worker)',
        'cluster-worker',
        { CLUSTER_MODE: 'worker' },
      ],
    ]);
  });

  it('a switch that only changes build options stays one unit', () => {
    const file = `
function:
  name: api
options:
  bundler:
    minify: !switch { var: PROD, default: 'no', cases: { 'yes': true, 'no': false } }
`;
    const units = unitsOfFile('.', '/r/lambforge.yaml', file);
    expect(units).toHaveLength(1);
    expect(units[0].variant).toBeUndefined();
  });

  it('!if on a variable: graphql-server + graphql-server-subscriptions', () => {
    const file = `
function:
  name: !if { var: SUBSCRIPTIONS_ONLY, then: graphql-server-subscriptions, else: graphql-server }
`;
    expect(switchVariables(file)).toEqual({
      SUBSCRIPTIONS_ONLY: ['false', 'true'],
    });
    expect(
      unitsOfFile('.', '/r/lambforge.yaml', file).map((u) => [
        u.variant,
        u.spec.function.name,
      ]),
    ).toEqual([
      ['SUBSCRIPTIONS_ONLY=false', 'graphql-server'],
      ['SUBSCRIPTIONS_ONLY=true', 'graphql-server-subscriptions'],
    ]);
  });

  it('combinations of two variables', () => {
    expect(variantCombinations({ A: ['1', '2'], B: ['x'] })).toEqual([
      { A: '1', B: 'x' },
      { A: '2', B: 'x' },
    ]);
  });
});

describe('what apply runs before a deploy', () => {
  it('build: of lambforge.yaml wins, then the package build script', () => {
    expect(
      buildCommand({ build: 'npm run build:es' }, { scripts: { build: 'x' } }),
    ).toBe('npm run build:es');
    expect(buildCommand({}, { scripts: { build: 'npx gcli build' } })).toBe(
      'npm run build',
    );
  });

  it('nothing to build: no script, or a placeholder echo', () => {
    expect(buildCommand({}, null)).toBeNull();
    expect(
      buildCommand({}, { scripts: { build: "echo 'static site'" } }),
    ).toBeNull();
  });
});
