import { ChildProcess, spawn, spawnSync } from 'child_process';
import { randomUUID } from 'crypto';
import { FSWatcher, watch } from 'fs';
import { sep } from 'path';
import { Subject } from 'rxjs';

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

/** Folders whose churn the editor never shows (installs, VCS). */
const IGNORED = new Set(['node_modules', '.git']);
const MAX_SESSIONS = 4;

interface Session {
  child: ChildProcess;
  watcher: FSWatcher | null;
}

export class TerminalManager {
  readonly events$ = new Subject<TerminalEvent>();
  private readonly sessions = new Map<string, Session>();

  constructor(
    private readonly root: string,
    private readonly env: () => NodeJS.ProcessEnv,
  ) {}

  open(size: { cols?: number; rows?: number }) {
    if (this.sessions.size >= MAX_SESSIONS) {
      throw new WorkspaceError(
        `At most ${MAX_SESSIONS} browser terminals at a time - close one first.`,
        429,
      );
    }
    const sessionId = randomUUID();
    const [command, args] = shellCommand();
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
    this.sessions.set(sessionId, {
      child,
      watcher: this.watchRoot((path) => emit({ kind: 'changed', data: path })),
    });
    return { sessionId, pty: command === 'script' };
  }

  input(sessionId: string, data: string) {
    this.session(sessionId).child.stdin?.write(data);
    return { written: data.length };
  }

  close(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      kill(session.child);
      this.forget(sessionId);
    }
    return { closed: !!session };
  }

  closeAll() {
    [...this.sessions.keys()].forEach((id) => this.close(id));
  }

  private session(sessionId: string): Session {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new WorkspaceError('This terminal is closed.', 404);
    }
    return session;
  }

  private forget(sessionId: string) {
    this.sessions.get(sessionId)?.watcher?.close();
    this.sessions.delete(sessionId);
  }

  /** Recursive watch of the root (Node >= 20 on Linux, macOS, Windows). */
  private watchRoot(onChange: (path: string) => void): FSWatcher | null {
    try {
      return watch(this.root, { recursive: true }, (_event, filename) => {
        const path = filename?.toString().split(sep).join('/');
        if (path && !path.split('/').some((part) => IGNORED.has(part))) {
          onChange(path);
        }
      });
    } catch {
      return null; // no watching: the terminal still works
    }
  }
}

/** The shell, in a PTY through `script` where the system has it. */
function shellCommand(): [string, string[]] {
  if (process.platform === 'win32') {
    return [process.env.ComSpec || 'cmd.exe', []];
  }
  const shell = process.env.SHELL || '/bin/sh';
  if (spawnSync('script', ['--version']).error) {
    return [shell, ['-i']];
  }
  return process.platform === 'darwin'
    ? ['script', ['-q', '/dev/null', shell, '-i']]
    : ['script', ['-qfec', `${shell} -i`, '/dev/null']];
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
