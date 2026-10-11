import 'jest';

import { existsSync, mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import {
  buildUnit,
  resolveGcliCommand,
  RUNNER_AUTH_EXIT_CODE,
  systemdQuote,
  SystemdUserService,
  unitPath,
} from '../src/commands/runner/daemon';

describe('[runner:daemon] unit file', () => {
  const unit = buildUnit({
    serviceName: 'lambforge-runner',
    execStart: [
      '/usr/bin/node',
      '/home/me/My Tools/gcli/release/index.js',
      'runner:start',
      '--ollama',
      'http://127.0.0.1:11434',
    ],
  });

  it('runs runner:start with absolute paths, quoting words with spaces', () => {
    expect(unit).toContain(
      'ExecStart=/usr/bin/node "/home/me/My Tools/gcli/release/index.js" runner:start --ollama http://127.0.0.1:11434',
    );
  });

  it('restarts on failure but not when the token is refused', () => {
    expect(unit).toContain('Restart=always');
    expect(unit).toContain(`RestartPreventExitStatus=${RUNNER_AUTH_EXIT_CODE}`);
  });

  it('is a user unit started with the session, after the network', () => {
    expect(unit).toContain('WantedBy=default.target');
    expect(unit).toContain('After=network-online.target');
  });

  it('never carries a runner token', () => {
    expect(unit).not.toMatch(/lfr_|--token/);
  });

  it('quotes per systemd rules', () => {
    expect(systemdQuote('plain/path-1.js')).toBe('plain/path-1.js');
    expect(systemdQuote('a b')).toBe('"a b"');
    expect(systemdQuote('say "hi"')).toBe('"say \\"hi\\""');
    expect(systemdQuote('C:\\x y')).toBe('"C:\\\\x y"');
  });
});

describe('[runner:daemon] how to start gcli again', () => {
  it('uses node + the gcli script when running under node', () => {
    expect(
      resolveGcliCommand(
        ['/usr/bin/node', '/opt/gcli/release/index.js'],
        '/usr/bin/node',
        false,
      ),
    ).toEqual({
      command: ['/usr/bin/node', '/opt/gcli/release/index.js'],
      warning: undefined,
    });
  });

  it('uses the binary itself when running as the SEA executable', () => {
    expect(
      resolveGcliCommand(['/opt/gcli-linux', 'x'], '/opt/gcli-linux', true),
    ).toEqual({
      command: ['/opt/gcli-linux'],
    });
  });

  it('warns when gcli runs from the npx cache', () => {
    const { warning } = resolveGcliCommand(
      [
        '/usr/bin/node',
        '/home/me/.npm/_npx/abc/node_modules/@gapi/gcli/release/index.js',
      ],
      '/usr/bin/node',
      false,
    );
    expect(warning).toMatch(/npm i -g @gapi\/gcli/);
  });
});

describe('[runner:daemon] systemctl --user', () => {
  // A throwaway home - never the real ~/.config/systemd/user.
  let home: string;
  beforeEach(() => {
    home = mkdtempSync(join(tmpdir(), 'gcli-daemon-'));
  });

  it('install writes the user unit, then daemon-reload -> enable -> restart', async () => {
    const calls: string[] = [];
    const exec = async (file: string, args: string[]) => {
      calls.push([file, ...args].join(' '));
      return { stdout: '' };
    };
    const path = await new SystemdUserService(
      'test-runner',
      exec,
      home,
    ).install('[Unit]\n');

    expect(path).toBe(join(home, '.config/systemd/user/test-runner.service'));
    expect(readFileSync(path, 'utf8')).toBe('[Unit]\n');
    expect(calls).toEqual([
      'systemctl --user daemon-reload',
      'systemctl --user enable test-runner.service',
      'systemctl --user restart test-runner.service',
    ]);
  });

  it('uninstall stops + disables, removes the unit and reloads', async () => {
    const calls: string[] = [];
    const exec = async (file: string, args: string[]) => {
      calls.push([file, ...args].join(' '));
      return { stdout: '' };
    };
    const service = new SystemdUserService('test-runner', exec, home);
    await service.install('[Unit]\n');
    calls.length = 0;

    await service.uninstall();

    expect(existsSync(unitPath('test-runner', home))).toBe(false);
    expect(calls).toEqual([
      'systemctl --user disable --now test-runner.service',
      'systemctl --user daemon-reload',
    ]);
  });

  it('reports whether lingering keeps it running after logout', async () => {
    const exec = async () => ({ stdout: 'Linger=yes\n' });
    expect(
      await new SystemdUserService('x', exec, home).lingerEnabled('me'),
    ).toBe(true);
  });
});
