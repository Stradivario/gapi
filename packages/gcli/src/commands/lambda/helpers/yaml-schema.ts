/* =============================================================================
 * ⚠️  SHARED PARSER — KEEP IN SYNC ACROSS REPOS  ⚠️
 *
 * This is the CANONICAL copy, shipped by the @gapi/gcli CLI. The lambforge
 * runtime images parse `lambforge.yaml` in-cluster with the SAME tags, so
 * byte-for-byte identical copies live in the fission-node runtime (only the
 * notice at the top of each file differs):
 *
 *   - fission-node/nodejs/lambforge-yaml.ts
 *   - fission-node/nodejs-graphql/src/app/core/lambforge-yaml.ts
 *
 * If you change the tags or resolution logic below, port the EXACT change to
 * those files (and vice-versa). Otherwise a spec that builds fine with the CLI
 * will fail to parse in-cluster (`unknown tag !<!switch>`) and break the lambda.
 * ============================================================================= */
import {
  CORE_SCHEMA,
  defineMappingTag,
  defineScalarTag,
  defineSequenceTag,
  load,
  mergeTag,
} from 'js-yaml';

/**
 * Conditional / environment-aware YAML tags for lambforge specs.
 *
 * These let a SINGLE spec file describe many deploy variants — e.g. the old
 * Docker servers (everything bundled) vs the new www.lambforge.com platform
 * (framework packages preinstalled in the env image, so they must stay
 * external) — by branching on external environment variables at load time.
 *
 * Plain YAML without these tags keeps parsing as before. The base is js-yaml 5's
 * `CORE_SCHEMA` (predictable YAML 1.2 core types — no `yes`/`no` booleans) plus
 * `mergeTag` so `<<` merge keys keep working alongside anchors `&` / aliases `*`
 * for de-duplication.
 *
 * Supported tags:
 *   !env  VAR                                  -> process.env.VAR ?? null
 *   !env  [VAR, default]                       -> process.env.VAR ?? default
 *   !switch { var, default, cases: { … } }     -> cases[process.env[var] ?? default]
 *   !if   { when, then, else }                 -> branch on truthiness of `when`
 *   !if   { var, equals, default, then, else } -> branch on (process.env[var] ?? default) === equals
 *
 * Example (old vs new servers from one file):
 *   options:
 *     bundler:
 *       external: !switch
 *         var: LAMBFORGE_TARGET
 *         default: docker
 *         cases:
 *           lambforge: *frameworkExternals   # preinstalled -> keep external
 *           docker: []                       # nothing preinstalled -> bundle all
 *
 * js-yaml 5's tag API builds collections incrementally with no "finalize" hook,
 * so the conditional tags parse into lightweight marker objects which a single
 * `resolveConditionals` pass then evaluates (depth-first, so nested tags and
 * anchored sub-trees resolve correctly).
 */

class EnvMarker {
  constructor(
    public name: unknown,
    public fallback: unknown = null,
  ) {}
}

class SwitchMarker {
  fields: Record<string, unknown> = {};
}

class IfMarker {
  fields: Record<string, unknown> = {};
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const isFalsy = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === false ||
  value === '' ||
  value === 'false' ||
  value === '0';

// `!env FOO` -> defer resolution to the evaluation pass so every form of !env
// (scalar and sequence) is resolved in exactly one place.
const envScalarTag = defineScalarTag<EnvMarker>('!env', {
  resolve: (source) => new EnvMarker(source),
});

// `!env [FOO, default]`
const envSequenceTag = defineSequenceTag<EnvMarker>('!env', {
  create: () => new EnvMarker(undefined),
  addItem: (marker, item, index) => {
    if (index === 0) {
      marker.name = item;
    } else if (index === 1) {
      marker.fallback = item;
    }
  },
});

const mappingMarkerOptions = <T extends SwitchMarker | IfMarker>(
  create: () => T,
) => ({
  create,
  addPair: (marker: T, key: unknown, value: unknown) => {
    marker.fields[String(key)] = value;
    return '';
  },
  has: (marker: T, key: unknown) => String(key) in marker.fields,
  keys: (marker: T) => Object.keys(marker.fields),
  get: (marker: T, key: unknown) => marker.fields[String(key)],
});

// `!switch { var, default, cases }`
const switchTag = defineMappingTag<SwitchMarker>(
  '!switch',
  mappingMarkerOptions(() => new SwitchMarker()),
);

// `!if { when | var/equals, then, else }`
const ifTag = defineMappingTag<IfMarker>(
  '!if',
  mappingMarkerOptions(() => new IfMarker()),
);

/**
 * js-yaml schema that understands the lambforge conditional tags. Pass it to
 * `load(content, { schema: LAMBFORGE_SCHEMA })` or use `loadYaml` below.
 */
export const LAMBFORGE_SCHEMA = CORE_SCHEMA.withTags(
  mergeTag,
  envScalarTag,
  envSequenceTag,
  switchTag,
  ifTag,
);

const resolveConditionals = (
  node: unknown,
  env: NodeJS.ProcessEnv = process.env,
): unknown => {
  if (node instanceof EnvMarker) {
    return env[String(node.name)] ?? resolveConditionals(node.fallback, env);
  }

  if (node instanceof SwitchMarker) {
    const { var: varName, default: fallback, cases } = node.fields;
    if (typeof varName !== 'string') {
      throw new Error(
        '!switch requires a "var" string naming the environment variable',
      );
    }
    const branches = isPlainObject(cases) ? cases : {};
    const selected = String(env[varName] ?? fallback ?? '');
    if (selected in branches) {
      return resolveConditionals(branches[selected], env);
    }
    if (fallback != null && String(fallback) in branches) {
      return resolveConditionals(branches[String(fallback)], env);
    }
    return null;
  }

  if (node instanceof IfMarker) {
    const f = node.fields;
    let matches: boolean;
    if (typeof f.var === 'string') {
      const current = env[f.var] ?? f.default;
      matches =
        'equals' in f
          ? String(current) === String(f.equals)
          : !isFalsy(current);
    } else {
      matches = !isFalsy(resolveConditionals(f.when, env));
    }
    return resolveConditionals(matches ? f.then : f.else, env) ?? null;
  }

  if (Array.isArray(node)) {
    return node.map((n) => resolveConditionals(n, env));
  }

  if (isPlainObject(node)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(node)) {
      out[key] = resolveConditionals(node[key], env);
    }
    return out;
  }

  return node;
};

/** `env`: the variables the conditional tags read (default process.env) -
    gcli plan evaluates one file once per `!switch` case this way. */
export const loadYaml = <T = unknown>(
  content: string,
  env: NodeJS.ProcessEnv = process.env,
): T =>
  resolveConditionals(load(content, { schema: LAMBFORGE_SCHEMA }), env) as T;

/** Every `!switch` / `!if` variable of a file with the values that pick a
    branch, e.g. `{ CLUSTER_MODE: ['provisioner', 'worker'] }` or
    `{ SUBSCRIPTIONS_ONLY: ['false', 'true'] }` - one file, two lambdas. */
export function switchVariables(content: string): Record<string, string[]> {
  const found: Record<string, Set<string>> = {};
  const walk = (node: unknown) => {
    if (node instanceof SwitchMarker) {
      const { var: name, cases } = node.fields;
      if (typeof name === 'string' && isPlainObject(cases)) {
        found[name] = found[name] ?? new Set();
        Object.keys(cases).forEach((c) => found[name].add(c));
        Object.values(cases).forEach(walk);
      }
      return;
    }
    if (node instanceof IfMarker) {
      // `!if { var, equals? }`: the value that matches, and one that does not
      const { var: name, equals } = node.fields;
      if (typeof name === 'string') {
        found[name] = found[name] ?? new Set();
        if (equals !== undefined) {
          found[name].add(String(equals));
          found[name].add(String(equals) === 'false' ? 'true' : 'false');
        } else {
          found[name].add('false');
          found[name].add('true');
        }
      }
      Object.values(node.fields).forEach(walk);
      return;
    }
    if (Array.isArray(node)) node.forEach(walk);
    else if (isPlainObject(node)) Object.values(node).forEach(walk);
  };
  walk(load(content, { schema: LAMBFORGE_SCHEMA }));
  return Object.fromEntries(Object.entries(found).map(([k, v]) => [k, [...v]]));
}
