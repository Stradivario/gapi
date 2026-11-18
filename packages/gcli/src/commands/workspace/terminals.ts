import { ChildProcess, spawn, spawnSync } from 'child_process';
import { randomUUID } from 'crypto';
import { FSWatcher, readdirSync, readFileSync, readlinkSync, watch } from 'fs';
import { sep } from 'path';
import { from, Subject, Subscription } from 'rxjs';
import { bufferTime, concatMap, filter, mergeMap } from 'rxjs/operators';

import { WorkspaceError } from './files';

/**
 * Browser terminals on this machine (`workspace:start --allow-terminal`,
 * plan 36): an interactive shell in the workspace root whose output, exit
 * and changed files are pushed to the browser as {@link TerminalEvent}s.
 *
 * A real terminal (echo, line editing, colours) needs a PTY. v1 gets one
 * without native code from the system's `script` (util-linux / BSD); where
 * it is missing (Windows) the shell runs on plain pipes. node-pty is a
 * follow-up.
 */
export interface TerminalEvent {
  sessionId: string;
  kind: 'output' | 'exit' | 'changed';
  /** output text, or the changed path (relative, `/`-separated) */
  data?: string;
  exitCode?: number | null;
}

const MAX_SESSIONS = 4;
/** Changed paths are collected this long, then filtered in one go. */
const WATCH_BATCH_MS = 150;

interface Watch {
  watcher: FSWatcher | null;
  changes: Subscription;
}

export class TerminalManager {
  readonly events$ = new Subject<TerminalEvent>();
  /** shells (`terminal/*`) */
  private readonly sessions = new Map<string, ChildProcess>();
  /** file watches (`watch/*`) - the open editor, terminal or not */
  private readonly watches = new Map<string, Watch>();

  /**
   * @param notIgnored keeps the paths `.gitignore` does not ignore
   *   (WorkspaceFiles.notIgnored) - a build's output never reaches the
   *   browser.
   */
  constructor(
    private readonly root: string,
    private readonly env: () => NodeJS.ProcessEnv,
    private readonly notIgnored: (paths: string[]) => Promise<string[]> = (
      paths,
    ) => Promise.resolve(paths),
  ) {}

  open(size: { cols?: number; rows?: number }) {
    if (this.sessions.size >= MAX_SESSIONS) {
      throw new WorkspaceError(
        `At most ${MAX_SESSIONS} browser terminals at a time - close one first.`,
        429,
      );
    }
    const sessionId = randomUUID();
    const [command, args] = shellCommand(size);
    const child = spawn(command, args, {
      cwd: this.root,
      env: {
        ...this.env(),
        TERM: 'xterm-256color',
        COLUMNS: String(size.cols ?? 80),
        LINES: String(size.rows ?? 24),
      },
      stdio: 'pipe',
      // its own process group: closing kills everything started in it
      detached: process.platform !== 'win32',
    });
    const emit = (event: Omit<TerminalEvent, 'sessionId'>) =>
      this.events$.next({ sessionId, ...event });
    const print = (chunk: Buffer) =>
      emit({ kind: 'output', data: chunk.toString('utf8') });
    child.stdout?.on('data', print);
    child.stderr?.on('data', print);
    child.on('exit', (code) => {
      emit({ kind: 'exit', exitCode: code });
      this.forget(sessionId);
    });
    child.on('error', (e) =>
      emit({ kind: 'output', data: `\r\n${e.message}\r\n` }),
    );
    this.sessions.set(sessionId, child);
    return { sessionId, pty: command === 'script' };
  }

  input(sessionId: string, data: string) {
    const child = this.sessions.get(sessionId);
    if (!child) {
      throw new WorkspaceError('This terminal is closed.', 404);
    }
    child.stdin?.write(data);
    return { written: data.length };
  }

  /**
   * The browser terminal changed size: the shell's PTY gets it (`stty -F
   * <pts>`), and the kernel sends its process group SIGWINCH - programs
   * redraw. Only with a PTY (`script`); on plain pipes there is nothing to
   * resize. Never throws: a resize is cosmetic.
   */
  resize(sessionId: string, size: { cols?: number; rows?: number }) {
    const child = this.sessions.get(sessionId);
    if (!child?.pid) {
      return { resized: false };
    }
    const tty = shellTty(child.pid);
    if (!tty) {
      return { resized: false };
    }
    const cols = dimension(size.cols, 0);
    const rows = dimension(size.rows, 0);
    if (!cols || !rows) {
      return { resized: false };
    }
    const flag = process.platform === 'darwin' ? '-f' : '-F';
    const result = spawnSync(
      'stty',
      [flag, tty, 'cols', String(cols), 'rows', String(rows)],
      { stdio: 'ignore' },
    );
    return { resized: result.status === 0 };
  }

  close(sessionId: string) {
    const child = this.sessions.get(sessionId);
    if (child) {
      kill(child);
      this.forget(sessionId);
    }
    return { closed: !!child };
  }

  /**
   * Watch the root for the browser editor (no shell, no --allow-terminal:
   * only the names of changed files, which `list` shows anyway). Changes
   * are batched, de-duplicated and `.gitignore`d ones dropped, then sent as
   * `changed` events of this watch.
   */
  watch() {
    if (this.watches.size >= MAX_SESSIONS) {
      throw new WorkspaceError(
        `At most ${MAX_SESSIONS} editors watching at a time.`,
        429,
      );
    }
    const sessionId = randomUUID();
    const changed$ = new Subject<string>();
    const changes = changed$
      .pipe(
        bufferTime(WATCH_BATCH_MS),
        filter((paths) => paths.length > 0),
        concatMap((paths) => from(this.notIgnored([...new Set(paths)]))),
        mergeMap((paths) => from(paths)),
      )
      .subscribe((path) =>
        this.events$.next({ sessionId, kind: 'changed', data: path }),
      );
    this.watches.set(sessionId, {
      watcher: this.watchRoot((path) => changed$.next(path)),
      changes,
    });
    return { sessionId };
  }

  unwatch(sessionId: string) {
    const watch = this.watches.get(sessionId);
    watch?.watcher?.close();
    watch?.changes.unsubscribe();
    this.watches.delete(sessionId);
    return { closed: !!watch };
  }

  closeAll() {
    [...this.sessions.keys()].forEach((id) => this.close(id));
    [...this.watches.keys()].forEach((id) => this.unwatch(id));
  }

  private forget(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  /** Recursive watch of the root (Node >= 20 on Linux, macOS, Windows). */
  private watchRoot(onChange: (path: string) => void): FSWatcher | null {
    try {
      return watch(this.root, { recursive: true }, (_event, filename) => {
        const path = filename?.toString().split(sep).join('/');
        if (path) {
          onChange(path);
        }
      });
    } catch {
      return null; // no watching: the terminal still works
    }
  }
}

/**
 * The PTY of the shell `script` started for a session (its child process):
 * linux reads /proc (busybox has no `ps -o tty`), macOS asks `ps`. null =
 * no PTY found (pipes, or not supported here).
 */
export function shellTty(scriptPid: number): string | null {
  try {
    if (process.platform === 'linux') {
      const child = readdirSync('/proc')
        .filter((name) => /^\d+$/.test(name))
        .find((pid) => {
          try {
            // stat: "pid (comm) state ppid ..." - comm may hold spaces
            const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
            return (
              Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[1]) ===
              scriptPid
            );
          } catch {
            return false;
          }
        });
      if (!child) return null;
      const tty = readlinkSync(`/proc/${child}/fd/0`);
      return tty.startsWith('/dev/pts/') ? tty : null;
    }
    if (process.platform === 'darwin') {
      const children = spawnSync('pgrep', ['-P', String(scriptPid)], {
        encoding: 'utf8',
      }).stdout.trim();
      const pid = children.split('\n')[0];
      if (!pid) return null;
      const tty = spawnSync('ps', ['-o', 'tty=', '-p', pid], {
        encoding: 'utf8',
      }).stdout.trim();
      return tty && tty !== '??' ? `/dev/${tty}` : null;
    }
  } catch {
    // not found / not permitted
  }
  return null;
}

/** A terminal dimension from the browser as a safe integer (it goes into
    a shell command line). */
export function dimension(value: unknown, fallback: number) {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n >= 10 && n <= 1000 ? n : fallback;
}

/**
 * The shell, in a PTY through `script` where the system has it. The PTY
 * gets the browser terminal's size first (`stty`): readline asks the PTY,
 * not COLUMNS, so without it lines wrapped at 80 columns in a wide editor.
 */
export function shellCommand(
  size: { cols?: number; rows?: number } = {},
  platform: string = process.platform,
  hasScript = () => !spawnSync('script', ['--version']).error,
): [string, string[]] {
  if (platform === 'win32') {
    return [process.env.ComSpec || 'cmd.exe', []];
  }
  const shell = process.env.SHELL || '/bin/sh';
  if (!hasScript()) {
    return [shell, ['-i']];
  }
  const cols = dimension(size.cols, 80);
  const rows = dimension(size.rows, 24);
  const start = `stty cols ${cols} rows ${rows} 2>/dev/null; exec ${shell} -i`;
  return platform === 'darwin'
    ? ['script', ['-q', '/dev/null', '/bin/sh', '-c', start]]
    : ['script', ['-qfec', start, '/dev/null']];
}

function kill(child: ChildProcess) {
  try {
    if (child.pid && process.platform !== 'win32') {
      process.kill(-child.pid, 'SIGTERM');
    } else {
      child.kill('SIGTERM');
    }
  } catch {
    // already gone
  }
}
