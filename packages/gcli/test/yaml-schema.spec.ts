import 'jest';

import { loadYaml } from '../src/commands/lambda/helpers/yaml-schema';

describe('[lambforge yaml schema]', () => {
  const ENV_KEYS = ['LAMBFORGE_TARGET', 'FEATURE_FLAG', 'BUNDLE_ALL'];
  const original: Record<string, string | undefined> = {};

  beforeEach(() => {
    ENV_KEYS.forEach((key) => {
      original[key] = process.env[key];
      delete process.env[key];
    });
  });

  afterEach(() => {
    ENV_KEYS.forEach((key) => {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    });
  });

  it('parses plain yaml unchanged (backward compatible)', () => {
    const out = loadYaml<{ a: number; b: string[] }>('a: 1\nb: [x, y]\n');
    expect(out).toEqual({ a: 1, b: ['x', 'y'] });
  });

  it('keeps native anchors, aliases and merge keys working', () => {
    const out = loadYaml<Record<string, unknown>>(`
base: &base
  bundle: true
  external: ['@gapi/core']
derived:
  <<: *base
  minify: true
reused: *base
`);
    expect(out.derived).toEqual({
      bundle: true,
      external: ['@gapi/core'],
      minify: true,
    });
    expect(out.reused).toEqual({ bundle: true, external: ['@gapi/core'] });
  });

  describe('!env', () => {
    it('resolves a scalar env var, null when missing', () => {
      process.env.FEATURE_FLAG = 'on';
      expect(loadYaml('v: !env FEATURE_FLAG')).toEqual({ v: 'on' });
      delete process.env.FEATURE_FLAG;
      expect(loadYaml('v: !env FEATURE_FLAG')).toEqual({ v: null });
    });

    it('uses the default from [VAR, default] when missing', () => {
      expect(loadYaml('v: !env [FEATURE_FLAG, fallback]')).toEqual({
        v: 'fallback',
      });
      process.env.FEATURE_FLAG = 'real';
      expect(loadYaml('v: !env [FEATURE_FLAG, fallback]')).toEqual({
        v: 'real',
      });
    });
  });

  describe('!switch', () => {
    const spec = `
.externals: &externals
  - '@gapi/core'
  - 'rxjs'
options:
  external: !switch
    var: LAMBFORGE_TARGET
    default: docker
    cases:
      lambforge: *externals
      docker: []
`;

    it('selects the new-platform branch when the env var matches', () => {
      process.env.LAMBFORGE_TARGET = 'lambforge';
      const out = loadYaml<{ options: { external: string[] } }>(spec);
      expect(out.options.external).toEqual(['@gapi/core', 'rxjs']);
    });

    it('falls back to the default case when the env var is unset', () => {
      const out = loadYaml<{ options: { external: string[] } }>(spec);
      expect(out.options.external).toEqual([]);
    });

    it('throws a helpful error when "var" is missing', () => {
      expect(() => loadYaml('x: !switch\n  cases: {a: 1}\n')).toThrow(
        /!switch requires a "var"/,
      );
    });
  });

  describe('!if', () => {
    it('branches on truthiness of a resolved env value', () => {
      const spec = `
x: !if
  when: !env BUNDLE_ALL
  then: bundled
  else: external
`;
      expect(loadYaml(spec)).toEqual({ x: 'external' });
      process.env.BUNDLE_ALL = 'true';
      expect(loadYaml(spec)).toEqual({ x: 'bundled' });
    });

    it('treats "false"/"0"/empty as falsy', () => {
      const spec = `
x: !if
  when: !env BUNDLE_ALL
  then: yes
  else: no
`;
      process.env.BUNDLE_ALL = 'false';
      expect(loadYaml(spec)).toEqual({ x: 'no' });
      process.env.BUNDLE_ALL = '0';
      expect(loadYaml(spec)).toEqual({ x: 'no' });
    });

    it('supports var/equals comparison with a default', () => {
      const spec = `
x: !if
  var: LAMBFORGE_TARGET
  default: docker
  equals: lambforge
  then: slim
  else: full
`;
      expect(loadYaml(spec)).toEqual({ x: 'full' });
      process.env.LAMBFORGE_TARGET = 'lambforge';
      expect(loadYaml(spec)).toEqual({ x: 'slim' });
    });
  });
});
