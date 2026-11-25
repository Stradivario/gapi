import { existsSync, readdirSync, readFileSync } from 'fs';
import { dirname, join, relative, resolve, sep } from 'path';

import {
  loadYaml,
  switchVariables,
} from '~/commands/lambda/helpers/yaml-schema';
import { GitignoreMatcher } from '~/commands/workspace/gitignore';

import { Loose } from './drift';

/** Folders never searched: dependencies, build output, gcli's build cache. */
const SKIP = new Set(['node_modules', '.git', '.gcache', 'dist', 'release']);
const MAX_DEPTH = 8;

/** One lambforge.yaml of a repository (graphql-server plan 46). */
export interface Unit {
  /** folder relative to the root ('.' = the root itself) */
  id: string;
  file: string;
  /** the file as written */
  own: Loose;
  /** with `environment:` inherited from the nearest parent file when the
      unit has none (owner: its own always wins) */
  spec: Loose;
  /** the folder whose environment it inherited, if any */
  inheritsFrom?: string;
  /** a YAML error, when the file did not parse */
  error?: string;
  /** one file, several lambdas (`!switch` on a variable, e.g.
      CLUSTER_MODE=worker): the variables this unit is evaluated with */
  vars?: Record<string, string>;
  /** `CLUSTER_MODE=worker` - shown next to the folder */
  variant?: string;
}

/** Unique per lambda: the folder, plus the variant when the file has several. */
export const unitKey = (u: Pick<Unit, 'id' | 'variant'>) =>
  u.variant ? `${u.id} (${u.variant})` : u.id;

const MAX_VARIANTS = 16;

/** Every combination of the file's switch variables, e.g.
    [{ CLUSTER_MODE: 'provisioner' }, { CLUSTER_MODE: 'worker' }]. */
export function variantCombinations(
  vars: Record<string, string[]>,
): Record<string, string>[] {
  return Object.entries(vars)
    .reduce<Record<string, string>[]>(
      (combos, [name, cases]) =>
        combos.flatMap((c) => cases.map((v) => ({ ...c, [name]: v }))),
      [{}],
    )
    .slice(0, MAX_VARIANTS);
}

/** The units of one file: one per variant that makes a DIFFERENT lambda
    (a switch that only changes build options stays one unit). */
export function unitsOfFile(id: string, file: string, content: string): Unit[] {
  const combos = variantCombinations(switchVariables(content));
  if (combos.length <= 1) {
    const own = (loadYaml(content) ?? {}) as Loose;
    return [{ id, file, own, spec: own }];
  }
  const seen = new Set<string>();
  const units: Unit[] = [];
  for (const vars of combos) {
    const own = (loadYaml(content, { ...process.env, ...vars }) ?? {}) as Loose;
    const name = String(own.function?.name ?? '');
    if (seen.has(name)) continue;
    seen.add(name);
    units.push({
      id,
      file,
      own,
      spec: own,
      vars,
      variant: Object.entries(vars)
        .map(([k, v]) => `${k}=${v}`)
        .join(' '),
    });
  }
  if (units.length === 1) {
    const own = (loadYaml(content) ?? {}) as Loose;
    return [{ id, file, own, spec: own }];
  }
  return units;
}

/** The git root above `start`, else `start`. */
export function repoRoot(start: string): string {
  let dir = resolve(start);
  while (dirname(dir) !== dir) {
    if (existsSync(join(dir, '.git'))) return dir;
    dir = dirname(dir);
  }
  return resolve(start);
}

/** Every lambforge.yaml under `root`, skipping SKIP and what .gitignore ignores. */
export function findFiles(root: string): string[] {
  const ignore = new GitignoreMatcher(root);
  const found: string[] = [];
  const walk = (dir: string, depth: number) => {
    if (depth > MAX_DEPTH) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      const rel = relative(root, path).split(sep).join('/');
      if (entry.isDirectory()) {
        if (!SKIP.has(entry.name) && !ignore.ignored(rel, true))
          walk(path, depth + 1);
      } else if (entry.name === 'lambforge.yaml' && !ignore.ignored(rel)) {
        found.push(path);
      }
    }
  };
  walk(root, 0);
  return found.sort();
}

/** The units of a repository, parents before children. */
export function discover(root: string): Unit[] {
  const units: Unit[] = findFiles(root).flatMap((file) => {
    const id = relative(root, dirname(file)).split(sep).join('/') || '.';
    try {
      return unitsOfFile(id, file, readFileSync(file, 'utf8'));
    } catch (e) {
      return [{ id, file, own: {}, spec: {}, error: (e as Error).message }];
    }
  });
  // the first unit of a folder stands for it (variants share their parent)
  const byFolder = new Map<string, Unit>();
  units.forEach((u) => byFolder.has(u.id) || byFolder.set(u.id, u));
  const parentOf = (id: string): Unit | undefined => {
    let dir = id;
    while (dir !== '.') {
      dir = dirname(dir) === '.' || dirname(dir) === dir ? '.' : dirname(dir);
      const unit = byFolder.get(dir);
      if (unit && unit.id !== id) return unit;
    }
    return undefined;
  };
  for (const unit of units) {
    if (unit.own.environment || unit.id === '.') continue;
    const parent = parentOf(unit.id);
    if (parent?.own.environment) {
      unit.spec = { ...unit.own, environment: parent.own.environment };
      unit.inheritsFrom = parent.id;
    }
  }
  return units;
}
