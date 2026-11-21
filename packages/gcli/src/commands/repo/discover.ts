import { existsSync, readdirSync, readFileSync } from 'fs';
import { dirname, join, relative, resolve, sep } from 'path';

import { loadYaml } from '~/commands/lambda/helpers/yaml-schema';
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
  const units: Unit[] = findFiles(root).map((file) => {
    const id = relative(root, dirname(file)).split(sep).join('/') || '.';
    try {
      const own = (loadYaml(readFileSync(file, 'utf8')) ?? {}) as Loose;
      return { id, file, own, spec: own };
    } catch (e) {
      return { id, file, own: {}, spec: {}, error: (e as Error).message };
    }
  });
  const byFolder = new Map(units.map((u) => [u.id, u]));
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
