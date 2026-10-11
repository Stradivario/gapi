import { execFile } from 'child_process';
import { realpathSync } from 'fs';
import { mkdir, rm, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

/**
 * Runs `gcli runner:start` as a per-user systemd service, so the runner
 * starts with the session (or at boot, with lingering), restarts on crashes
 * and survives closing the terminal.
 *
 * Adapted from packages/cli-builder's SystemctlService
 * (install -> daemon-reload -> enable -> restart), with these differences:
 *  - a USER unit (~/.config/systemd/user, `systemctl --user`): no root, and
 *    the service runs as the user who owns ~/.graphql-server/runner.json and
 *    usually the Ollama install;
 *  - the runner token is never written into the unit - it stays in the 0600
 *    runner.json that `runner:start` reads;
 *  - commands are executed without a shell (execFile), arguments quoted for
 *    systemd;
 *  - RestartPreventExitStatus stops a refused/revoked token from
 *    restart-looping forever.
 */

export const DEFAULT_SERVICE_NAME = 'lambforge-runner';

/** Exit code `runner:start` uses when Lambforge refuses the runner token (EX_CONFIG). */
export const RUNNER_AUTH_EXIT_CODE = 78;

export interface DaemonOptions {
  serviceName: string;
  /** The program systemd runs, then its arguments (`runner:start ...`). */
  execStart: string[];
  env?: Record<string, string>;
  description?: string;
}

/** Quote one ExecStart/Environment word the way systemd parses it. */
export const systemdQuote = (word: string) =>
  /^[A-Za-z0-9_@%+=:,./-]+$/.test(word)
    ? word
    : `"${word.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

export const unitPath = (serviceName: string, home = homedir()) =>
  join(home, '.config', 'systemd', 'user', `${serviceName}.service`);

export const buildUnit = ({
  serviceName,
  execStart,
  env = {},
  description = 'Lambforge local AI runner',
}: DaemonOptions) =>
  [
    '[Unit]',
    `Description=${description} (${serviceName})`,
    'After=network-online.target',
    'Wants=network-online.target',
    '',
    '[Service]',
    'Type=simple',
    `ExecStart=${execStart.map(systemdQuote).join(' ')}`,
    ...Object.entries(env).map(
      ([key, value]) => `Environment=${systemdQuote(`${key}=${value}`)}`,
    ),
    'Restart=always',
    'RestartSec=5',
    // A refused token won't fix itself - don't hammer the API with it.
    `RestartPreventExitStatus=${RUNNER_AUTH_EXIT_CODE}`,
    '',
    '[Install]',
    'WantedBy=default.target',
    '',
  ].join('\n');

/**
 * How to start this same gcli again from systemd: absolute node + script, or
 * the SEA binary itself. Warns about locations that won't survive (npx cache).
 */
export const resolveGcliCommand = (
  argv = process.argv,
  execPath = process.execPath,
  isSeaBinary = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('node:sea').isSea() as boolean;
    } catch {
      return false;
    }
  })(),
): { command: string[]; warning?: string } => {
  if (isSeaBinary) {
    return { command: [execPath] };
  }
  let script = argv[1];
  try {
    script = realpathSync(script);
  } catch {
    // keep as given
  }
  const ephemeral = /[/\\]_npx[/\\]|[/\\]\.npm[/\\]_cacache/.test(script);
  return {
    command: [execPath, script],
    warning: ephemeral
      ? `gcli is running from the npx cache (${script}), which npm may clean up and break the service. ` +
        'Install it globally first: npm i -g @gapi/gcli, then re-run this command with `gcli`.'
      : undefined,
  };
};

type Exec = (file: string, args: string[]) => Promise<{ stdout: string }>;
const defaultExec: Exec = (file, args) =>
  promisify(execFile)(file, args, { encoding: 'utf8' });

export class SystemdUserService {
  constructor(
    private serviceName = DEFAULT_SERVICE_NAME,
    private exec: Exec = defaultExec,
    // Explicit, not $HOME: os.homedir() can ignore a changed HOME (it did
    // under jest) and tests must never write into the real ~/.config.
    private home = homedir(),
  ) {}

  get unit() {
    return `${this.serviceName}.service`;
  }

  /** install -> daemon-reload -> enable -> restart (picks up a changed unit). */
  async install(unitContent: string) {
    const path = unitPath(this.serviceName, this.home);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, unitContent, 'utf-8');
    await this.systemctl('daemon-reload');
    await this.systemctl('enable', this.unit);
    await this.systemctl('restart', this.unit);
    return path;
  }

  async uninstall() {
    await this.systemctl('disable', '--now', this.unit).catch(() => undefined);
    const path = unitPath(this.serviceName, this.home);
    await rm(path, { force: true });
    await this.systemctl('daemon-reload');
    return path;
  }

  async status() {
    // `status` exits 3 for an inactive unit - still a useful answer.
    return this.systemctl('status', '--no-pager', '--lines=15', this.unit)
      .then((r) => r.stdout)
      .catch((e) => e.stdout || e.message);
  }

  /** Whether the service keeps running after logout / starts at boot. */
  async lingerEnabled(user = process.env.USER) {
    try {
      const { stdout } = await this.exec('loginctl', [
        'show-user',
        user,
        '--property=Linger',
      ]);
      return /Linger=yes/.test(stdout);
    } catch {
      return false;
    }
  }

  private systemctl(...args: string[]) {
    return this.exec('systemctl', ['--user', ...args]);
  }
}

export const assertSystemdAvailable = () => {
  if (process.platform !== 'linux') {
    throw new Error(
      `runner:daemon uses systemd and is Linux-only for now (this is ${process.platform}). ` +
        'Run `gcli runner:start` under your own process manager meanwhile.',
    );
  }
};
