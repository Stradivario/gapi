import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * `.gitignore` without git (a plain folder, or no git installed): the
 * patterns of every `.gitignore` from the root down to a path, with git's
 * rules - `#` comments, `!` negation, `dir/` (folders only), a `/` that
 * anchors to the file's folder, `*`, `**`, `?`, `[...]`; the deepest file
 * and the last matching line win; nothing inside an ignored folder comes
 * back. Global excludes and `.git/info/exclude` are git's own business.
 */
interface Rule {
  regex: RegExp;
  negate: boolean;
  dirOnly: boolean;
}

export function parseGitignore(text: string): Rule[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/(?<!\\)\s+$/, ''))
    .filter((line) => line && !line.startsWith('#'))
    .map(toRule);
}

function toRule(pattern: string): Rule {
  let line = pattern;
  const negate = line.startsWith('!');
  if (negate) line = line.slice(1);
  if (line.startsWith('\\')) line = line.slice(1); // \# \! literal
  const dirOnly = line.endsWith('/');
  if (dirOnly) line = line.slice(0, -1);
  // a slash at the start or in the middle anchors it to the file's folder
  const anchored = line.includes('/');
  if (line.startsWith('/')) line = line.slice(1);
  const body = globToRegex(line);
  return {
    regex: new RegExp(anchored ? `^${body}$` : `^(?:.*/)?${body}$`),
    negate,
    dirOnly,
  };
}

function globToRegex(glob: string): string {
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      const atStart = i === 0 || glob[i - 1] === '/';
      if (atStart && glob[i + 2] === '/') {
        out += '(?:.*/)?'; // "**/" - any folders, or none
        i += 2;
      } else {
        out += '.*'; // "/**" or "a**b"
        i += 1;
      }
    } else if (c === '*') {
      out += '[^/]*';
    } else if (c === '?') {
      out += '[^/]';
    } else if (c === '[' && glob.indexOf(']', i + 1) > i + 1) {
      const end = glob.indexOf(']', i + 1);
      const set = glob.slice(i + 1, end).replace(/\\/g, '\\\\');
      out += `[${set.startsWith('!') ? `^${set.slice(1)}` : set}]`;
      i = end;
    } else {
      out += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return out;
}

export class GitignoreMatcher {
  /** folder (relative, '' = root) -> its .gitignore rules */
  private readonly rules = new Map<string, Rule[]>();

  constructor(
    private readonly root: string,
    private readonly readText: (path: string) => string = (path) =>
      readFileSync(path, 'utf8'),
  ) {}

  /** A `.gitignore` changed: read them again. */
  clear() {
    this.rules.clear();
  }

  /** `rel` (root-relative, `/`-separated) or a folder above it is ignored. */
  ignored(rel: string, isDir = false): boolean {
    const parts = rel.split('/').filter(Boolean);
    return parts.some((_, i) =>
      this.matches(parts.slice(0, i + 1), i < parts.length - 1 || isDir),
    );
  }

  private matches(parts: string[], isDir: boolean): boolean {
    let ignored = false;
    // every .gitignore from the root down; deeper ones and later lines win
    for (let depth = 0; depth < parts.length; depth++) {
      const relToFile = parts.slice(depth).join('/');
      for (const rule of this.rulesOf(parts.slice(0, depth).join('/'))) {
        if ((!rule.dirOnly || isDir) && rule.regex.test(relToFile)) {
          ignored = !rule.negate;
        }
      }
    }
    return ignored;
  }

  private rulesOf(dir: string): Rule[] {
    let rules = this.rules.get(dir);
    if (!rules) {
      try {
        rules = parseGitignore(
          this.readText(join(this.root, dir, '.gitignore')),
        );
      } catch {
        rules = [];
      }
      this.rules.set(dir, rules);
    }
    return rules;
  }
}
