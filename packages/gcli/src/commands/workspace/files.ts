import { execFile } from 'child_process';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from 'path';
import { promisify } from 'util';

const run = promisify(execFile);

/** A refused or failed operation: answered to the agent as `{ error }`. */
export class WorkspaceError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

const MAX_READ_BYTES = 512 * 1024;
const MAX_WRITE_BYTES = 5 * 1024 * 1024;
const DEFAULT_LIST_LIMIT = 500;
const MAX_LIST_LIMIT = 5000;
const DEFAULT_SEARCH_RESULTS = 100;
const MAX_SEARCH_RESULTS = 1000;
const MAX_MATCH_TEXT = 300;
// Never listed or searched (walk without git); `.git` is never writable.
const SKIP_DIRS = new Set(['node_modules', '.git']);

// Files that usually hold credentials. The agent can't read or write them
// unless gcli was started with --allow-secrets (templates stay readable).
const SECRET_FILE =
  /^(\.env(\..+)?|.*\.(pem|key|p12|pfx|keystore|jks)|id_(rsa|dsa|ecdsa|ed25519)(\.pub)?|\.npmrc|\.pypirc|\.netrc|credentials(\.json)?)$/i;
const SECRET_TEMPLATE = /\.(example|sample|template|dist|defaults)$/i;

export const isSecretFile = (path: string) => {
  const name = basename(path);
  return SECRET_FILE.test(name) && !SECRET_TEMPLATE.test(name);
};

export const contentHash = (content: string) =>
  createHash('sha256').update(content).digest('hex').slice(0, 16);

const toPosix = (p: string) => p.split(sep).join('/');

export interface FileEntry {
  path: string;
  size?: number;
  type: 'file' | 'dir';
}

export interface WorkspaceFilesOptions {
  allowSecrets?: boolean;
}

/**
 * File operations confined to one directory (the workspace root). Every path
 * is resolved against the root and refused if it - or, through a symlink,
 * its real location - is outside it.
 */
export class WorkspaceFiles {
  private gitRepo?: Promise<boolean>;

  constructor(
    readonly root: string,
    private options: WorkspaceFilesOptions = {},
  ) {}

  /** Absolute path for a workspace-relative one, or a WorkspaceError. */
  async resolvePath(input: string | undefined, { forWrite = false } = {}) {
    const rel = (input ?? '.').trim() || '.';
    const abs = resolve(this.root, rel);
    const fromRoot = relative(this.root, abs);
    if (fromRoot.startsWith('..') || isAbsolute(fromRoot)) {
      throw new WorkspaceError(
        `${input} is outside the workspace root - paths are relative to ${this.root}`,
        403,
      );
    }
    // A symlink inside the root may point outside it: check the real path
    // of the deepest part that exists.
    let existing = abs;
    for (;;) {
      try {
        const real = await fs.realpath(existing);
        const realFromRoot = relative(this.root, real);
        if (realFromRoot.startsWith('..') || isAbsolute(realFromRoot)) {
          throw new WorkspaceError(
            `${input} resolves outside the workspace root (symlink)`,
            403,
          );
        }
        break;
      } catch (e) {
        if (e instanceof WorkspaceError) throw e;
        const parent = dirname(existing);
        if (parent === existing) break;
        existing = parent;
      }
    }
    const posix = toPosix(fromRoot) || '.';
    if (forWrite && (posix === '.git' || posix.startsWith('.git/'))) {
      throw new WorkspaceError('.git is not writable from the chat', 403);
    }
    if (!this.options.allowSecrets && isSecretFile(abs)) {
      throw new WorkspaceError(
        `${posix} looks like a secrets file and is not accessible from the chat (start gcli with --allow-secrets to change that)`,
        403,
      );
    }
    return { abs, rel: posix };
  }

  isGitRepo(): Promise<boolean> {
    this.gitRepo ??= run('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: this.root,
    }).then(
      ({ stdout }) => stdout.trim() === 'true',
      () => false,
    );
    return this.gitRepo;
  }

  async gitBranch(): Promise<string | undefined> {
    if (!(await this.isGitRepo())) return undefined;
    return run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: this.root,
    }).then(
      ({ stdout }) => stdout.trim() || undefined,
      () => undefined,
    );
  }

  /** Every file under `dir` (git-aware), relative to the root. */
  private async allFiles(dir: string, limit: number): Promise<string[]> {
    if (await this.isGitRepo()) {
      const { stdout } = await run(
        'git',
        ['ls-files', '-co', '--exclude-standard', '-z', '--', dir],
        { cwd: this.root, maxBuffer: 64 * 1024 * 1024 },
      );
      return stdout
        .split('\0')
        .filter(Boolean)
        .filter((p) => !p.split('/').some((part) => SKIP_DIRS.has(part)));
    }
    const out: string[] = [];
    const walk = async (relDir: string) => {
      if (out.length > limit) return;
      const entries = await fs
        .readdir(join(this.root, relDir), { withFileTypes: true })
        .catch(() => []);
      for (const entry of entries) {
        if (SKIP_DIRS.has(entry.name)) continue;
        const rel = relDir === '.' ? entry.name : `${relDir}/${entry.name}`;
        if (entry.isDirectory()) await walk(rel);
        else if (entry.isFile()) out.push(rel);
        if (out.length > limit) return;
      }
    };
    await walk(dir);
    return out;
  }

  async list(args: { path?: string; recursive?: boolean; limit?: number }) {
    const { rel } = await this.resolvePath(args.path);
    const limit = Math.min(
      Math.max(1, args.limit ?? DEFAULT_LIST_LIMIT),
      MAX_LIST_LIMIT,
    );
    const prefix = rel === '.' ? '' : `${rel}/`;
    const files = (await this.allFiles(rel, limit * 4)).filter(
      (p) => !prefix || p.startsWith(prefix),
    );
    let entries: FileEntry[];
    if (args.recursive === false) {
      const seen = new Map<string, FileEntry>();
      for (const file of files) {
        const rest = file.slice(prefix.length);
        const slash = rest.indexOf('/');
        const path = prefix + (slash < 0 ? rest : rest.slice(0, slash));
        if (!seen.has(path)) {
          seen.set(path, { path, type: slash < 0 ? 'file' : 'dir' });
        }
      }
      entries = [...seen.values()].sort(
        (a, b) =>
          (a.type === b.type ? 0 : a.type === 'dir' ? -1 : 1) ||
          a.path.localeCompare(b.path),
      );
    } else {
      entries = files.sort().map((path) => ({ path, type: 'file' as const }));
    }
    const truncated = entries.length > limit;
    entries = entries.slice(0, limit);
    await Promise.all(
      entries
        .filter((e) => e.type === 'file')
        .map(async (e) => {
          e.size = await fs
            .stat(join(this.root, e.path))
            .then((s) => s.size)
            .catch(() => undefined);
        }),
    );
    // git lists deleted-but-tracked files too
    return {
      files: entries.filter((e) => e.type === 'dir' || e.size !== undefined),
      truncated,
    };
  }

  async read(args: { path?: string; startLine?: number; endLine?: number }) {
    if (!args.path) throw new WorkspaceError('path is required');
    const { abs, rel } = await this.resolvePath(args.path);
    const stat = await fs.stat(abs).catch(() => null);
    if (!stat) throw new WorkspaceError(`${rel} does not exist`, 404);
    if (stat.isDirectory()) {
      throw new WorkspaceError(`${rel} is a directory - use LocalListFiles`);
    }
    const buffer = await fs.readFile(abs);
    if (buffer.subarray(0, 8000).includes(0)) {
      return { path: rel, size: stat.size, binary: true, content: '' };
    }
    const text = buffer.toString('utf-8');
    const lines = text.split('\n');
    const startLine = Math.max(1, Math.floor(args.startLine ?? 1));
    const endLine = Math.min(
      lines.length,
      Math.floor(args.endLine ?? lines.length),
    );
    let content = lines.slice(startLine - 1, endLine).join('\n');
    const truncated = Buffer.byteLength(content) > MAX_READ_BYTES;
    if (truncated) {
      content = Buffer.from(content).subarray(0, MAX_READ_BYTES).toString();
    }
    return {
      path: rel,
      size: stat.size,
      totalLines: lines.length,
      startLine,
      endLine,
      hash: contentHash(text),
      truncated,
      binary: false,
      content,
    };
  }

  private async currentText(abs: string) {
    return fs.readFile(abs, 'utf-8').catch((e) => {
      if (e?.code === 'ENOENT') return null;
      throw e;
    });
  }

  async write(args: {
    path?: string;
    content?: string;
    expectedHash?: string;
  }) {
    if (!args.path) throw new WorkspaceError('path is required');
    const content = args.content ?? '';
    if (Buffer.byteLength(content) > MAX_WRITE_BYTES) {
      throw new WorkspaceError('content is larger than 5 MB');
    }
    const { abs, rel } = await this.resolvePath(args.path, { forWrite: true });
    const before = await this.currentText(abs);
    if (args.expectedHash && before !== null) {
      if (contentHash(before) !== args.expectedHash) {
        throw new WorkspaceError(
          `${rel} changed since you read it (hash mismatch) - read it again`,
          409,
        );
      }
    }
    await fs.mkdir(dirname(abs), { recursive: true });
    await fs.writeFile(abs, content, 'utf-8');
    return {
      path: rel,
      size: Buffer.byteLength(content),
      hash: contentHash(content),
      created: before === null,
    };
  }

  async edit(args: {
    path?: string;
    oldText?: string;
    newText?: string;
    replaceAll?: boolean;
    expectedHash?: string;
  }) {
    if (!args.path) throw new WorkspaceError('path is required');
    if (!args.oldText) throw new WorkspaceError('oldText is required');
    const { abs, rel } = await this.resolvePath(args.path, { forWrite: true });
    const before = await this.currentText(abs);
    if (before === null) throw new WorkspaceError(`${rel} does not exist`, 404);
    if (args.expectedHash && contentHash(before) !== args.expectedHash) {
      throw new WorkspaceError(
        `${rel} changed since you read it (hash mismatch) - read it again`,
        409,
      );
    }
    const count = before.split(args.oldText).length - 1;
    if (count === 0) {
      throw new WorkspaceError(
        `oldText was not found in ${rel} - read the file again and copy the text exactly (whitespace included)`,
      );
    }
    if (count > 1 && !args.replaceAll) {
      throw new WorkspaceError(
        `oldText occurs ${count} times in ${rel} - add surrounding lines to make it unique, or pass replaceAll`,
      );
    }
    const after = args.replaceAll
      ? before.split(args.oldText).join(args.newText ?? '')
      : before.replace(args.oldText, () => args.newText ?? '');
    await fs.writeFile(abs, after, 'utf-8');
    return {
      path: rel,
      replacements: args.replaceAll ? count : 1,
      size: Buffer.byteLength(after),
      hash: contentHash(after),
    };
  }

  async delete(args: { path?: string }) {
    if (!args.path) throw new WorkspaceError('path is required');
    const { abs, rel } = await this.resolvePath(args.path, { forWrite: true });
    const stat = await fs.lstat(abs).catch(() => null);
    if (!stat) return { path: rel, deleted: false };
    if (stat.isDirectory()) {
      throw new WorkspaceError(
        `${rel} is a directory - only files can be deleted (use RunCommand for more)`,
      );
    }
    await fs.unlink(abs);
    return { path: rel, deleted: true };
  }

  async search(args: {
    pattern?: string;
    path?: string;
    glob?: string;
    regex?: boolean;
    caseSensitive?: boolean;
    maxResults?: number;
  }) {
    if (!args.pattern) throw new WorkspaceError('pattern is required');
    const { rel } = await this.resolvePath(args.path);
    const max = Math.min(
      Math.max(1, args.maxResults ?? DEFAULT_SEARCH_RESULTS),
      MAX_SEARCH_RESULTS,
    );
    let raw: { path: string; line: number; text: string }[];
    if (await this.isGitRepo()) {
      const pathspec = args.glob
        ? rel === '.'
          ? args.glob
          : `${rel}/**/${args.glob}`
        : rel;
      const flags = [
        'grep',
        '-n',
        '-I',
        '--no-color',
        '--untracked',
        args.regex === false ? '-F' : '-E',
      ];
      if (!args.caseSensitive) flags.push('-i');
      const { stdout } = await run(
        'git',
        [...flags, '-e', args.pattern, '--', `:(glob)${pathspec}`],
        { cwd: this.root, maxBuffer: 64 * 1024 * 1024 },
      ).catch((e) => {
        // exit 1 = no match; anything else is a real failure
        if (e?.code === 1) return { stdout: '' };
        throw new WorkspaceError(
          `search failed: ${String(e?.stderr || e?.message).trim()}`,
        );
      });
      raw = stdout
        .split('\n')
        .filter(Boolean)
        .map((row) => {
          const m = /^(.*?):(\d+):(.*)$/.exec(row);
          return m ? { path: m[1], line: Number(m[2]), text: m[3] } : null;
        })
        .filter(Boolean);
    } else {
      let re: RegExp;
      try {
        re = new RegExp(
          args.regex === false
            ? args.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            : args.pattern,
          args.caseSensitive ? '' : 'i',
        );
      } catch (e) {
        throw new WorkspaceError(`invalid pattern: ${(e as Error).message}`);
      }
      const globRe = args.glob
        ? new RegExp(
            `(^|/)${args.glob
              .replace(/[.+^${}()|[\]\\]/g, '\\$&')
              .replace(/\*/g, '[^/]*')
              .replace(/\?/g, '.')}$`,
          )
        : null;
      raw = [];
      for (const file of await this.allFiles(rel, 20_000)) {
        if (globRe && !globRe.test(file)) continue;
        const text = await fs.readFile(join(this.root, file)).catch(() => null);
        if (!text || text.subarray(0, 8000).includes(0)) continue;
        text
          .toString('utf-8')
          .split('\n')
          .forEach((line, i) => {
            if (raw.length <= max && re.test(line)) {
              raw.push({ path: file, line: i + 1, text: line });
            }
          });
        if (raw.length > max) break;
      }
    }
    const matches = raw
      .filter((m) => this.options.allowSecrets || !isSecretFile(m.path))
      .map((m) => ({ ...m, text: m.text.trim().slice(0, MAX_MATCH_TEXT) }));
    return {
      matches: matches.slice(0, max),
      truncated: matches.length > max,
    };
  }
}
