import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { load } from 'js-yaml';
import { tmpdir } from 'os';
import { join } from 'path';

import { discover } from '~/commands/repo/discover';
import { environmentChanges, functionChanges } from '~/commands/repo/drift';
import { domainsOf, toYaml } from '~/commands/repo/export';
import { planUnit, unmanaged } from '~/commands/repo/plan';
import { check } from '~/commands/repo/schema-check';
import { crossChecks } from '~/commands/repo/validate';

const repo = (files: Record<string, string>) => {
  const root = mkdtempSync(join(tmpdir(), 'gcli-repo-'));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
};

const ENV = 'environment:\n  name: nodejs\n  image: rxdi/fission-node:1\n';

describe('discover', () => {
  it('finds nested files, skips .gcache / node_modules / .gitignore, inherits the parent environment', () => {
    const root = repo({
      '.gitignore': 'ignored/\n',
      'lambforge.yaml': ENV,
      'packages/a/lambforge.yaml': 'function:\n  name: a\n',
      'packages/b/lambforge.yaml':
        'function:\n  name: b\nenvironment:\n  name: own\n',
      'packages/a/.gcache/lambforge.yaml': 'function:\n  name: stale\n',
      'node_modules/x/lambforge.yaml': 'function:\n  name: dep\n',
      'ignored/lambforge.yaml': 'function:\n  name: ignored\n',
    });
    const units = discover(root);
    expect(units.map((u) => u.id)).toEqual(['.', 'packages/a', 'packages/b']);
    expect(units[1].spec.environment.name).toBe('nodejs');
    expect(units[1].inheritsFrom).toBe('.');
    expect(units[2].spec.environment.name).toBe('own');
    expect(units[2].inheritsFrom).toBeUndefined();
  });

  it('reports a file that does not parse', () => {
    const units = discover(repo({ 'lambforge.yaml': 'function: [' }));
    expect(units[0].error).toBeTruthy();
  });
});

describe('schema check', () => {
  it('warns on unknown keys, errors on wrong types and missing keys', () => {
    const findings = check('u', {
      '.base': { anything: 1 },
      function: {
        name: 'a',
        config: [],
        network: ['public'],
        scaleOptions: { minScale: 'x' },
      },
      domains: [{ name: 'shop', servs: 'a' }],
      triggers: { time: { cron: '* * * * *' } },
    });
    const by = (path: string) => findings.find((f) => f.path === path);
    expect(by('function.config')?.level).toBe('warning');
    expect(by('domains[0].servs')?.level).toBe('warning');
    expect(by('function.scaleOptions.minScale')?.level).toBe('error');
    expect(by('triggers.time')?.message).toContain('triggerName');
    expect(findings.some((f) => f.path.startsWith('.base'))).toBe(false);
  });

  it('accepts a full valid file', () => {
    expect(
      check('u', {
        function: { name: 'a', route: 'a', method: ['GET'] },
        environment: { name: 'e' },
      }),
    ).toEqual([]);
  });
});

describe('cross checks', () => {
  it('flags two units with the same lambda name and domains naming an unknown lambda', () => {
    const unit = (id: string, spec: object) => ({
      id,
      file: '',
      own: spec,
      spec,
    });
    const out = crossChecks([
      unit('a', { function: { name: 'x' } }),
      unit('b', {
        function: { name: 'x' },
        domains: [{ name: 'shop', serves: 'nope' }],
      }),
    ]);
    expect(out.map((f) => f.level)).toEqual(['error', 'warning']);
  });
});

describe('drift', () => {
  it('compares only keys the file sets; lists as sets; 0 = server default', () => {
    const live = {
      route: 'a',
      network: ['private', 'public'],
      secrets: [{ name: 's' }],
      scaleOptions: { maxScale: 3, maxCpu: 500 },
    };
    expect(
      functionChanges(
        {
          route: 'a',
          network: ['public', 'private'],
          secrets: ['s'],
          scaleOptions: { maxCpu: 0 },
        },
        live,
      ),
    ).toEqual([]);
    expect(functionChanges({ scaleOptions: { maxScale: 2 } }, live)).toEqual([
      { field: 'scaleOptions.maxScale', now: 3, wanted: 2 },
    ]);
  });

  it('ignores environment fields the server did not return', () => {
    expect(
      environmentChanges({ image: 'b', maxPods: 0 }, { image: 'a' }),
    ).toEqual([{ field: 'image', now: 'a', wanted: 'b' }]);
  });
});

describe('plan + export round trip', () => {
  const lambda = {
    id: 'L1',
    name: 'shop',
    route: 'shop',
    env: 'nodejs',
    method: ['GET'],
    network: ['public'],
    secrets: [{ name: 'db' }],
    configs: [],
    envSecrets: [],
    scaleOptions: { executorType: 'newdeploy', maxScale: 2 },
  };
  const env = {
    name: 'nodejs',
    image: 'img:1',
    builder: 'b:1',
    region: 'EU_CENTRAL',
  };
  const trigger = { lambdaId: 'L1', triggerName: 'nightly', cron: '0 0 * * *' };
  const domains = [
    {
      id: 'd',
      hostname: 'shop.lambforge.app',
      status: 'active',
      routeMode: 'prefix' as const,
      lambdaId: 'L1',
      platform: true,
    },
  ];
  const live = {
    lambdas: [lambda, { id: 'L2', name: 'other' }],
    environments: [env],
    timeTriggers: [trigger],
    mqTriggers: [],
    domains,
  };

  it('an exported file plans in sync and validates clean', () => {
    const spec = load(
      toYaml(lambda, env, trigger, domainsOf('L1', 'shop', domains)),
    ) as Record<string, unknown>;
    const unit = { id: '.', file: '', own: spec, spec };
    expect(check('.', spec)).toEqual([]);
    const plan = planUnit(unit, live);
    expect(plan.sections.map((s) => [s.section, s.state])).toEqual([
      ['function', 'in-sync'],
      ['environment', 'in-sync'],
      ['triggers.time', 'in-sync'],
      ['domain shop', 'in-sync'],
    ]);
    expect(unmanaged([unit], live)).toEqual(['other']);
  });

  it('shows a missing lambda and a changed field', () => {
    const missing = { function: { name: 'new' } };
    expect(
      planUnit({ id: 'n', file: '', own: missing, spec: missing }, live)
        .sections[0].state,
    ).toBe('missing');
    const changed = { function: { name: 'shop', route: 'store' } };
    const s = planUnit({ id: 'c', file: '', own: changed, spec: changed }, live)
      .sections[0];
    expect(s.state).toBe('changes');
    expect(s.changes).toEqual([
      { field: 'route', now: 'shop', wanted: 'store' },
    ]);
  });

  it('does not plan an inherited environment again in every unit', () => {
    const own = { function: { name: 'shop' } };
    const plan = planUnit(
      {
        id: 'p',
        file: '',
        own,
        spec: { ...own, environment: { name: 'nodejs', image: 'other' } },
      },
      live,
    );
    expect(plan.sections.map((s) => s.section)).toEqual(['function']);
  });
});
