import { ChildProcess, spawn } from 'child_process';

import { WorkspaceError } from './files';

const DEFAULT_TIMEOUT_S = 300;
const MAX_TIMEOUT_S = 1800;
// Kept from each stream of a finished command: the end is what explains a
// failure (the summary line of a test run, the last stack trace).
const MAX_STREAM_CHARS = 20_000;
const MAX_PROCESS_LINES = 5000;
const MAX_PROCESSES = 20;
const DEFAULT_WAIT_S = 30;
const MAX_WAIT_S = 300;
const KILL_GRACE_MS = 5000;

const ANSI = /\x1b\[[0-9;?]*[ -/]*[@-~]|\x1b\][^\x07]*\x07/g;
export const stripAnsi = (text: string) => text.replace(ANSI, '');

// Inherited from gcli's own environment when --inherit-env is not given:
// enough for node/npm/git/nvm/pnpm to work, no tokens or keys from the shell.
const BASE_ENV = [
  'PATH',
  'HOME',
  'USER',
  'LOGNAME',
  'SHELL',
  'LANG',
  'LC_ALL',
  'LC_CTYPE',
  'TERM',
  'TMPDIR',
  'TMP',
  'TEMP',
  'TZ',
  'NVM_DIR',
  'NVM_BIN',
  'NVM_INC',
  'PNPM_HOME',
  'VOLTA_HOME',
  'BUN_INSTALL',
  'DENO_INSTALL',
  'GOPATH',
  'CARGO_HOME',
  'RUSTUP_HOME',
  'JAVA_HOME',
  'PYENV_ROOT',
  'XDG_CONFIG_HOME',
  'XDG_CACHE_HOME',
  'XDG_DATA_HOME',
  'XDG_RUNTIME_DIR',
  'DISPLAY',
  'WAYLAND_DISPLAY',
  'DOCKER_HOST',
  // Windows
  'SystemRoot',
  'windir',
  'ComSpec',
  'PATHEXT',
  'APPDATA',
  'LOCALAPPDATA',
  'USERPROFILE',
  'HOMEDRIVE',
  'HOMEPATH',
  'ProgramFiles',
  'ProgramFiles(x86)',
  'ProgramData',
  'NUMBER_OF_PROCESSORS',
];

export interface EnvOptions {
  inheritEnv?: boolean;
  passEnv?: string[];
}

export const buildEnv = (
  options: EnvOptions,
  extra: Record<string, string> = {},
  source: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv => {
  const env: NodeJS.ProcessEnv = {};
  if (options.inheritEnv) {
    Object.assign(env, source);
  } else {
    for (const key of [...BASE_ENV, ...(options.passEnv ?? [])]) {
      if (source[key] !== undefined) env[key] = source[key];
    }
  }
  return {
    ...env,
    // never block on a prompt nobody can answer
    GIT_TERMINAL_PROMPT: '0',
    NO_COLOR: '1',
    FORCE_COLOR: '0',
    ...extra,
  };
};

const shellOf = (command: string): [string, string[]] =>
  process.platform === 'win32'
    ? [process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', command]]
    : [process.env.SHELL || '/bin/sh', ['-c', command]];

/** Kills the command and everything it started (its process group). */
const killTree = (child: ChildProcess, signal: NodeJS.Signals = 'SIGTERM') => {
  if (!child.pid || child.exitCode !== null) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F']);
    } else {
      process.kill(-child.pid, signal);
    }
  } catch {
    try {
      child.kill(signal);
    } catch {
      // already gone
    }
  }
};

const terminate = (child: ChildProcess) => {
  killTree(child, 'SIGTERM');
  const hard = setTimeout(() => killTree(child, 'SIGKILL'), KILL_GRACE_MS);
  hard.unref();
  child.once('exit', () => clearTimeout(hard));
};

/** Keeps only the last `max` characters (and says so). */
class TailBuffer {
  private text = '';
  dropped = 0;
  constructor(private max: number) {}
  push(chunk: string) {
    this.text += chunk;
    if (this.text.length > this.max) {
      this.dropped += this.text.length - this.max;
      this.text = this.text.slice(-this.max);
    }
  }
  toString() {
    return this.dropped
      ? `[... ${this.dropped} earlier characters omitted ...]\n${this.text}`
      : this.text;
  }
}

export interface CommandResult {
  command: string;
  cwd: string;
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
}

/** Runs one command to completion (RunCommand). */
export const runCommand = (args: {
  command: string;
  cwd: string;
  displayCwd: string;
  timeoutSeconds?: number;
  env: NodeJS.ProcessEnv;
  signal?: AbortSignal;
}): Promise<CommandResult> =>
  new Promise((resolvePromise, reject) => {
    const timeoutS = Math.min(
      Math.max(1, args.timeoutSeconds ?? DEFAULT_TIMEOUT_S),
      MAX_TIMEOUT_S,
    );
    const started = Date.now();
    const [shell, shellArgs] = shellOf(args.command);
    const child = spawn(shell, shellArgs, {
      cwd: args.cwd,
      env: args.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
      windowsHide: true,
    });
    const stdout = new TailBuffer(MAX_STREAM_CHARS);
    const stderr = new TailBuffer(MAX_STREAM_CHARS);
    child.stdout.setEncoding('utf-8').on('data', (d) => stdout.push(d));
    child.stderr.setEncoding('utf-8').on('data', (d) => stderr.push(d));
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      terminate(child);
    }, timeoutS * 1000);
    const onAbort = () => terminate(child);
    args.signal?.addEventListener('abort', onAbort, { once: true });
    child.on('error', (e) => {
      clearTimeout(timer);
      args.signal?.removeEventListener('abort', onAbort);
      reject(new WorkspaceError(`could not start the command: ${e.message}`));
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      args.signal?.removeEventListener('abort', onAbort);
      resolvePromise({
        command: args.command,
        cwd: args.displayCwd,
        exitCode: code,
        signal,
        timedOut,
        durationMs: Date.now() - started,
        stdout: stripAnsi(stdout.toString()),
        stderr: stripAnsi(stderr.toString()),
      });
    });
  });

export interface ProcessInfo {
  id: string;
  name?: string;
  command: string;
  cwd: string;
  status: 'running' | 'exited' | 'stopped' | 'failed';
  pid?: number;
  exitCode?: number;
  startedAt: string;
}

interface ManagedProcess extends ProcessInfo {
  child: ChildProcess;
  lines: string[];
  // number of lines ever produced; lines[0] is line (total - lines.length + 1)
  total: number;
  partial: string;
  listeners: Set<() => void>;
}

/**
 * Background processes started by the chat (StartProcess): dev servers and
 * watchers that outlive a tool call. They live as long as gcli does - every
 * one is stopped when it exits - and their output is kept as a ring buffer.
 */
export class ProcessManager {
  private processes = new Map<string, ManagedProcess>();
  private nextId = 1;

  constructor(private onChange: () => void = () => undefined) {}

  list(): ProcessInfo[] {
    return [...this.processes.values()].map((p) => this.info(p));
  }

  private info(p: ManagedProcess): ProcessInfo {
    return {
      id: p.id,
      name: p.name,
      command: p.command,
      cwd: p.cwd,
      status: p.status,
      pid: p.pid,
      exitCode: p.exitCode,
      startedAt: p.startedAt,
    };
  }

  private get(id: string) {
    const p = id && this.processes.get(id);
    if (!p) {
      throw new WorkspaceError(
        `no process ${id} - ListProcesses shows the running ones`,
        404,
      );
    }
    return p;
  }

  async start(args: {
    command: string;
    cwd: string;
    displayCwd: string;
    name?: string;
    waitFor?: string;
    waitSeconds?: number;
    env: NodeJS.ProcessEnv;
    signal?: AbortSignal;
  }) {
    const running = [...this.processes.values()].filter(
      (p) => p.status === 'running',
    );
    if (running.length >= MAX_PROCESSES) {
      throw new WorkspaceError(
        `${MAX_PROCESSES} processes are already running - stop one first`,
      );
    }
    // Forget finished ones so the list stays short.
    for (const p of this.processes.values()) {
      if (p.status !== 'running') this.processes.delete(p.id);
    }
    let waitRe: RegExp | undefined;
    if (args.waitFor) {
      try {
        waitRe = new RegExp(args.waitFor, 'i');
      } catch (e) {
        throw new WorkspaceError(`invalid waitFor: ${(e as Error).message}`);
      }
    }
    const [shell, shellArgs] = shellOf(args.command);
    const child = spawn(shell, shellArgs, {
      cwd: args.cwd,
      env: args.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
      windowsHide: true,
    });
    const id = `p${this.nextId++}`;
    const managed: ManagedProcess = {
      id,
      name: args.name,
      command: args.command,
      cwd: args.displayCwd,
      status: 'running',
      pid: child.pid,
      startedAt: new Date().toISOString(),
      child,
      lines: [],
      total: 0,
      partial: '',
      listeners: new Set(),
    };
    this.processes.set(id, managed);

    const onData = (chunk: string) => {
      const text = stripAnsi(managed.partial + chunk).replace(
        /\r(?!\n)/g,
        '\n',
      );
      const parts = text.split(/\r?\n/);
      managed.partial = parts.pop() ?? '';
      for (const line of parts) {
        managed.lines.push(line);
        managed.total += 1;
      }
      if (managed.lines.length > MAX_PROCESS_LINES) {
        managed.lines.splice(0, managed.lines.length - MAX_PROCESS_LINES);
      }
      managed.listeners.forEach((l) => l());
    };
    child.stdout.setEncoding('utf-8').on('data', onData);
    child.stderr.setEncoding('utf-8').on('data', onData);
    const finished = new Promise<void>((done) => {
      child.on('error', (e) => {
        managed.lines.push(`[gcli] could not start: ${e.message}`);
        managed.total += 1;
        managed.status = 'failed';
        managed.listeners.forEach((l) => l());
        this.onChange();
        done();
      });
      child.on('close', (code) => {
        if (managed.partial) {
          managed.lines.push(managed.partial);
          managed.total += 1;
          managed.partial = '';
        }
        if (managed.status === 'running') {
          managed.status = 'exited';
        }
        managed.exitCode = code ?? undefined;
        managed.listeners.forEach((l) => l());
        this.onChange();
        done();
      });
    });
    this.onChange();

    // Wait for the ready line (or the process to die, or the time to run out).
    const waitMs =
      Math.min(Math.max(0, args.waitSeconds ?? DEFAULT_WAIT_S), MAX_WAIT_S) *
      1000;
    let matched = false;
    await new Promise<void>((done) => {
      const timer = setTimeout(
        finish,
        waitRe ? waitMs : Math.min(waitMs, 3000),
      );
      const check = () => {
        if (waitRe && managed.lines.some((l) => waitRe.test(l))) {
          matched = true;
          finish();
        }
      };
      function finish() {
        clearTimeout(timer);
        managed.listeners.delete(check);
        args.signal?.removeEventListener('abort', finish);
        done();
      }
      managed.listeners.add(check);
      args.signal?.addEventListener('abort', finish, { once: true });
      void finished.then(finish);
      check();
    });
    return {
      processId: id,
      ...this.info(managed),
      matched: waitRe ? matched : undefined,
      output: managed.lines.slice(-60).join('\n'),
    };
  }

  logs(args: { processId?: string; tail?: number; sinceLine?: number }) {
    const p = this.get(args.processId);
    const first = p.total - p.lines.length + 1;
    let lines: string[];
    let fromLine: number;
    if (args.sinceLine !== undefined) {
      fromLine = Math.max(first, Math.floor(args.sinceLine) + 1);
      lines = p.lines.slice(fromLine - first);
      const tail = Math.min(Math.max(1, args.tail ?? 500), 2000);
      if (lines.length > tail) {
        fromLine += lines.length - tail;
        lines = lines.slice(-tail);
      }
    } else {
      const tail = Math.min(Math.max(1, args.tail ?? 100), 2000);
      lines = p.lines.slice(-tail);
      fromLine = p.total - lines.length + 1;
    }
    return {
      processId: p.id,
      status: p.status,
      exitCode: p.exitCode,
      fromLine,
      // pass as sinceLine next time to get only newer output
      nextLine: p.total,
      lines,
    };
  }

  async stop(args: { processId?: string }) {
    const p = this.get(args.processId);
    if (p.status === 'running') {
      p.status = 'stopped';
      const exited = new Promise<void>((done) => {
        if (p.child.exitCode !== null) done();
        else p.child.once('close', () => done());
      });
      terminate(p.child);
      await Promise.race([
        exited,
        new Promise((r) => setTimeout(r, KILL_GRACE_MS + 1000)),
      ]);
      this.onChange();
    }
    return { processId: p.id, status: p.status, exitCode: p.exitCode };
  }

  /** On gcli exit: nothing the chat started may outlive it. */
  stopAll() {
    for (const p of this.processes.values()) {
      if (p.status === 'running') {
        p.status = 'stopped';
        killTree(p.child, 'SIGTERM');
      }
    }
  }
}
