/**
 * Drift between a lambforge.yaml and what runs (graphql-server plan 46),
 * pure: only the keys the file SETS are compared - a key left out is "no
 * opinion", never drift.
 */

/** A YAML / API object read field by field - its shape is the file's or the
    server's, not ours. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Loose = Record<string, any>;

export interface Change {
  field: string;
  now: unknown;
  wanted: unknown;
}

export type UnitState = 'in-sync' | 'changes' | 'missing';

/** Lists compare as sets (order is no change); numbers / strings loosely
    (`"20"` and `20` are the same in YAML). */
const same = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) || Array.isArray(b)) {
    // true sets: a name listed twice on the live lambda is still one
    const x = [...new Set(((a as unknown[]) ?? []).map(String))].sort();
    const y = [...new Set(((b as unknown[]) ?? []).map(String))].sort();
    return x.length === y.length && x.every((v, i) => v === y[i]);
  }
  if (a === undefined || a === null || a === '')
    return b === undefined || b === null || b === '';
  return String(a) === String(b);
};

const names = (list: unknown) =>
  ((list as { name?: string }[]) ?? []).map((x) =>
    typeof x === 'string' ? x : x?.name,
  );

/** The function fields plan compares, and how to read them on the live lambda. */
const FUNCTION_FIELDS: Record<string, (live: Loose) => unknown> = {
  route: (l) => l.route,
  env: (l) => l.env,
  network: (l) => l.network,
  method: (l) => l.method,
  params: (l) => l.params,
  secrets: (l) => names(l.secrets),
  configs: (l) => names(l.configs),
  envSecrets: (l) => names(l.envSecrets),
  federation: (l) => l.federation,
  subgraphs: (l) => l.subgraphs,
  mcp: (l) => l.mcp,
};

const SCALE_FIELDS = [
  'executorType',
  'minScale',
  'maxScale',
  'targetCpu',
  'minCpu',
  'maxCpu',
  'minMemory',
  'maxMemory',
  'concurrency',
  'functionTimeout',
  'specializationTimeout',
  'idleTimeout',
];

export function functionChanges(wanted: Loose, live: Loose): Change[] {
  const out: Change[] = [];
  for (const [field, read] of Object.entries(FUNCTION_FIELDS)) {
    if (wanted[field] !== undefined && !same(read(live), wanted[field])) {
      out.push({ field, now: read(live), wanted: wanted[field] });
    }
  }
  for (const field of SCALE_FIELDS) {
    const w = wanted.scaleOptions?.[field];
    // 0 = "let the server choose within the plan" for the size / time fields
    if (w === undefined || (w === 0 && field !== 'minScale')) continue;
    const now = live.scaleOptions?.[field];
    if (!same(now, w))
      out.push({ field: `scaleOptions.${field}`, now, wanted: w });
  }
  return out;
}

const ENV_FIELDS = [
  'image',
  'builder',
  'poolSize',
  'maxPods',
  'builderPoolSize',
  'builderMaxParallelBuilds',
  'builderIdleTimeout',
  'minCpu',
  'maxCpu',
  'minMemory',
  'maxMemory',
  'region',
];

export function environmentChanges(wanted: Loose, live: Loose): Change[] {
  // a field the server did not return is unknown, not "unset"
  return ENV_FIELDS.filter(
    (f) => wanted[f] !== undefined && f in live && !same(live[f], wanted[f]),
  ).map((field) => ({ field, now: live[field], wanted: wanted[field] }));
}

export const stateOf = (exists: boolean, changes: Change[]): UnitState =>
  !exists ? 'missing' : changes.length ? 'changes' : 'in-sync';

export const show = (v: unknown) =>
  v === undefined || v === null
    ? '-'
    : Array.isArray(v)
      ? `[${v.join(', ')}]`
      : String(v);
