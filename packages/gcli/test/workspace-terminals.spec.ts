import 'jest';

import { execFileSync } from 'child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';
import { filter, map, scan, timeout } from 'rxjs/operators';

import { WorkspaceConnection } from '../src/commands/workspace/connection';
import { WorkspaceFiles } from '../src/commands/workspace/files';
import { CommandPolicy } from '../src/commands/workspace/policy';
import { TerminalManager } from '../src/commands/workspace/terminals';

/* Browser terminals (plan 36): a real shell in the workspace root, its
   output and the files it changes pushed as events. */
describe('[workspace] terminals', () => {
  let root: string;
  let terminals: TerminalManager;

  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), 'gcli-term-')));
    terminals = new TerminalManager(root, () => ({ ...process.env }));
  });
  afterEach(() => {
    terminals.closeAll();
    rmSync(root, { recursive: true, force: true });
  });

  const outputOf = (sessionId: string, marker: string) =>
    firstValueFrom(
      terminals.events$.pipe(
        filter((e) => e.sessionId === sessionId && e.kind === 'output'),
        scan((text, e) => text + (e.data ?? ''), ''),
        filter((text) => text.includes(marker)),
        timeout(10000),
      ),
    );

  it('runs what is typed and prints the output', async () => {
    const { sessionId } = terminals.open({ cols: 80, rows: 24 });
    const printed = outputOf(sessionId, 'hello-from-the-shell');
    terminals.input(sessionId, 'echo hello-from-the-shell\n');
    await expect(printed).resolves.toContain('hello-from-the-shell');
  });

  it('reports files changed in the root', async () => {
    const { sessionId } = terminals.open({});
    const changed = firstValueFrom(
      terminals.events$.pipe(
        filter((e) => e.sessionId === sessionId && e.kind === 'changed'),
        map((e) => e.data),
        filter((path) => path === 'made-by-test.txt'),
        timeout(10000),
      ),
    );
    writeFileSync(join(root, 'made-by-test.txt'), 'x');
    await expect(changed).resolves.toBe('made-by-test.txt');
  });

  it('closes a session and refuses input to it', () => {
    const { sessionId } = terminals.open({});
    expect(terminals.close(sessionId)).toEqual({ closed: true });
    expect(() => terminals.input(sessionId, 'ls\n')).toThrow(/closed/);
  });

  it('caps the open sessions', () => {
    for (let i = 0; i < 4; i++) terminals.open({});
    expect(() => terminals.open({})).toThrow(/At most 4/);
  });
});

describe('[workspace] terminal watch skips .gitignore', () => {
  it('reports src changes, never ignored build output', async () => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), 'gcli-ign-')));
    execFileSync('git', ['init', '-q'], { cwd: root });
    writeFileSync(join(root, '.gitignore'), 'dist/\n');
    mkdirSync(join(root, 'dist'));
    const files = new WorkspaceFiles(root);
    const terminals = new TerminalManager(
      root,
      () => ({ ...process.env }),
      (paths) => files.notIgnored(paths),
    );
    const { sessionId } = terminals.open({});
    const reported: string[] = [];
    const sub = terminals.events$
      .pipe(filter((e) => e.sessionId === sessionId && e.kind === 'changed'))
      .subscribe((e) => reported.push(e.data ?? ''));
    await new Promise((r) => setTimeout(r, 100));
    writeFileSync(join(root, 'dist', 'bundle.js'), 'x');
    writeFileSync(join(root, 'src.ts'), 'y');
    await firstValueFrom(
      terminals.events$.pipe(
        filter((e) => e.kind === 'changed' && e.data === 'src.ts'),
        timeout(10000),
      ),
    );
    await new Promise((r) => setTimeout(r, 400));
    expect(reported).toContain('src.ts');
    expect(reported.filter((p) => p.startsWith('dist'))).toEqual([]);
    sub.unsubscribe();
    terminals.closeAll();
    rmSync(root, { recursive: true, force: true });
  });
});

describe('[workspace] terminals need --allow-terminal', () => {
  const connect = (allowTerminal: boolean) =>
    new WorkspaceConnection({
      wsUrl: 'ws://test/subscriptions',
      token: 'lfw_secret',
      root: tmpdir(),
      version: 'test',
      logger: { log() {}, info() {}, warn() {}, error() {} },
      policy: new CommandPolicy('ask'),
      prompt: null,
      allowTerminal,
    });

  it('refuses a browser terminal without the flag', async () => {
    const connection = connect(false);
    await expect(
      connection.dispatch('terminal/open', { cols: 80, rows: 24 }),
    ).rejects.toThrow(/--allow-terminal/);
    connection.stop();
  });

  it('opens one with the flag', async () => {
    const connection = connect(true);
    const opened = (await connection.dispatch('terminal/open', {})) as {
      sessionId: string;
    };
    expect(opened.sessionId).toEqual(expect.any(String));
    connection.stop();
  });
});
