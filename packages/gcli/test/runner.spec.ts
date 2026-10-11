/* eslint-disable @typescript-eslint/no-explicit-any */
import 'jest';

import { deriveSubscriptionsUrl } from '../src/commands/runner/config';
import {
  FrameSender,
  RunnerAuthError,
  RunnerConnection,
  SocketLike,
} from '../src/commands/runner/connection';
import { resolveOllamaUrl } from '../src/commands/runner/ollama';
import { RunnerResponseFrame } from '../src/commands/runner/types';

const flush = async () => {
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setImmediate(r));
  }
};
const waitFor = async (check: () => boolean) => {
  for (let i = 0; i < 200 && !check(); i++) {
    await new Promise((r) => setTimeout(r, 5));
  }
  expect(check()).toBe(true);
};

/** Plays the Lambforge subscriptions server (subscriptions-transport-ws). */
class FakeServer implements SocketLike {
  readyState = 1;
  onopen = null;
  onmessage = null;
  onclose = null;
  onerror = null;
  sent: any[] = [];
  heartbeats: any[] = [];
  frames: RunnerResponseFrame[] = [];
  rejectWith?: string;

  send(data: string) {
    const msg = JSON.parse(data);
    this.sent.push(msg);
    if (msg.type === 'connection_init') {
      this.reply(
        this.rejectWith
          ? { type: 'connection_error', payload: { message: this.rejectWith } }
          : { type: 'connection_ack' },
      );
    } else if (msg.type === 'start' && msg.id !== 'runner-requests') {
      const { query, variables } = msg.payload;
      if (query.includes('runnerHeartbeat')) {
        this.heartbeats.push(variables);
        this.reply({
          id: msg.id,
          type: 'data',
          payload: { data: { runnerHeartbeat: { id: 'r1', name: 'My PC' } } },
        });
      } else if (query.includes('runnerRespond')) {
        this.frames.push(...variables.frames);
        this.reply({
          id: msg.id,
          type: 'data',
          payload: { data: { runnerRespond: { status: 'ok' } } },
        });
      }
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

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
  });

/** Plays Ollama: two models, a streamed chat completion that can be held open. */
const fakeOllama = () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  let release: () => void;
  const hold = new Promise<void>((r) => (release = r));
  let holdStream = false;
  const fetchFn = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (url.endsWith('/api/tags')) {
      return json({
        models: [
          {
            name: 'qwen3:32b',
            digest: 'a',
            details: { parameter_size: '32.8B', quantization_level: 'Q4_K_M' },
          },
          { name: 'gemma3:1b', digest: 'b', details: {} },
          // a retired Ollama cloud model: listed, but /api/show answers 410
          { name: 'glm-5.1:cloud', digest: 'c', details: {} },
        ],
      });
    }
    if (url.endsWith('/api/ps')) {
      // qwen is loaded (with a context smaller than its max); gemma is not
      return json({
        models: [
          { name: 'qwen3:32b', model: 'qwen3:32b', context_length: 65536 },
        ],
      });
    }
    if (url.endsWith('/api/show')) {
      const { model } = JSON.parse(init.body as string);
      if (model === 'glm-5.1:cloud') {
        return new Response(JSON.stringify({ error: 'glm-5.1 was retired' }), {
          status: 410,
        });
      }
      return json({
        capabilities:
          model === 'qwen3:32b'
            ? ['completion', 'tools', 'thinking']
            : ['completion'],
        model_info: { 'qwen3.context_length': 40960 },
      });
    }
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        init.signal?.addEventListener('abort', () =>
          controller.error(new Error('aborted')),
        );
        controller.enqueue(encoder.encode('data: {"a":"Hé'));
        // a multi-byte character split across reads
        const bytes = encoder.encode('llo"}\n\n');
        controller.enqueue(bytes.slice(0, 2));
        controller.enqueue(bytes.slice(2));
        if (holdStream) {
          await hold;
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
    return new Response(body, {
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
    });
  }) as typeof fetch;
  return {
    fetchFn,
    calls,
    holdStream: () => (holdStream = true),
    release: () => release(),
  };
};

const silentLogger = { log() {}, info() {}, warn() {}, error() {} };

const connect = (
  server: FakeServer,
  ollama: ReturnType<typeof fakeOllama>,
  extra: Record<string, unknown> = {},
) => {
  const connection = new RunnerConnection({
    wsUrl: 'ws://test/subscriptions',
    token: 'lfr_secret',
    ollamaUrl: 'http://127.0.0.1:11434',
    version: 'test',
    logger: silentLogger,
    createSocket: () => {
      setImmediate(() => server.onopen?.({}));
      return server;
    },
    fetchFn: ollama.fetchFn,
    flushMs: 1,
    ...extra,
  });
  const running = connection.run();
  return { connection, running };
};

const byRequest = (frames: RunnerResponseFrame[], requestId: string) =>
  frames.filter((f) => f.requestId === requestId).sort((a, b) => a.seq - b.seq);

describe('[runner] connection', () => {
  it('authenticates with the runner token, subscribes, and reports the Ollama models', async () => {
    const server = new FakeServer();
    const { connection, running } = connect(server, fakeOllama());
    await waitFor(() => server.heartbeats.length === 1);

    expect(server.sent[0]).toEqual({
      type: 'connection_init',
      payload: { runnerToken: 'lfr_secret' },
    });
    expect(server.sent[1]).toMatchObject({
      id: 'runner-requests',
      type: 'start',
    });
    expect(server.heartbeats[0]).toEqual({
      runnerVersion: 'test',
      models: [
        {
          name: 'qwen3:32b',
          parameterSize: '32.8B',
          quantization: 'Q4_K_M',
          family: undefined,
          capabilities: ['completion', 'tools', 'thinking'],
          contextLength: 40960,
          runtimeContextLength: 65536,
        },
        expect.objectContaining({
          name: 'gemma3:1b',
          capabilities: ['completion'],
        }),
      ],
    });

    connection.stop();
    await running;
  });

  it('proxies a chat request to Ollama and streams it back in order', async () => {
    const server = new FakeServer();
    const ollama = fakeOllama();
    const { connection, running } = connect(server, ollama);
    await waitFor(() => server.heartbeats.length === 1);

    server.request({
      requestId: 'q1',
      type: 'request',
      method: 'POST',
      path: '/v1/chat/completions',
      body: '{"model":"qwen3:32b"}',
    });
    await waitFor(() =>
      server.frames.some((f) => f.requestId === 'q1' && f.type === 'end'),
    );

    const frames = byRequest(server.frames, 'q1');
    expect(frames.map((f) => f.seq)).toEqual(frames.map((_, i) => i));
    expect(frames[0].type).toBe('ack');
    expect(frames[1]).toMatchObject({
      type: 'head',
      status: 200,
      data: 'text/event-stream',
    });
    expect(
      frames
        .filter((f) => f.type === 'chunk')
        .map((f) => f.data)
        .join(''),
    ).toBe('data: {"a":"Héllo"}\n\ndata: [DONE]\n\n');
    expect(frames[frames.length - 1].type).toBe('end');

    const chatCall = ollama.calls.find((c) =>
      c.url.endsWith('/v1/chat/completions'),
    );
    expect(chatCall.url).toBe('http://127.0.0.1:11434/v1/chat/completions');
    expect(chatCall.init.body).toBe('{"model":"qwen3:32b"}');

    connection.stop();
    await running;
  });

  it('refuses requests outside the allow-list without touching Ollama', async () => {
    const server = new FakeServer();
    const ollama = fakeOllama();
    const { connection, running } = connect(server, ollama);
    await waitFor(() => server.heartbeats.length === 1);
    const callsBefore = ollama.calls.length;

    server.request({
      requestId: 'evil',
      type: 'request',
      method: 'POST',
      path: '/api/pull',
      body: '{"model":"anything"}',
    });
    await waitFor(() => server.frames.some((f) => f.requestId === 'evil'));

    expect(byRequest(server.frames, 'evil')).toEqual([
      expect.objectContaining({ type: 'error', seq: 0 }),
    ]);
    expect(ollama.calls.length).toBe(callsBefore);

    connection.stop();
    await running;
  });

  it('aborts the Ollama generation when the chat is stopped', async () => {
    const server = new FakeServer();
    const ollama = fakeOllama();
    ollama.holdStream();
    const { connection, running } = connect(server, ollama);
    await waitFor(() => server.heartbeats.length === 1);

    server.request({
      requestId: 'q2',
      type: 'request',
      method: 'POST',
      path: '/v1/chat/completions',
      body: '{}',
    });
    await waitFor(() =>
      server.frames.some((f) => f.requestId === 'q2' && f.type === 'chunk'),
    );
    server.request({ requestId: 'q2', type: 'cancel' });
    await flush();

    const chatCall = ollama.calls.find((c) =>
      c.url.endsWith('/v1/chat/completions'),
    );
    expect(chatCall.init.signal.aborted).toBe(true);
    // A cancelled request is not reported back as a failure.
    expect(byRequest(server.frames, 'q2').some((f) => f.type === 'error')).toBe(
      false,
    );

    ollama.release();
    connection.stop();
    await running;
  });

  it('pings while Ollama keeps a request queued', async () => {
    const server = new FakeServer();
    const ollama = fakeOllama();
    let releaseHead: () => void;
    const slowFetch = (async (url: string, init?: RequestInit) => {
      if (url.endsWith('/v1/chat/completions')) {
        await new Promise<void>((r) => (releaseHead = r));
      }
      return ollama.fetchFn(url, init);
    }) as typeof fetch;
    const { connection, running } = connect(
      server,
      { ...ollama, fetchFn: slowFetch },
      { pingMs: 20 },
    );
    await waitFor(() => server.heartbeats.length === 1);

    server.request({
      requestId: 'queued',
      type: 'request',
      method: 'POST',
      path: '/v1/chat/completions',
      body: '{}',
    });
    await waitFor(() =>
      server.frames.some((f) => f.requestId === 'queued' && f.type === 'ping'),
    );

    releaseHead();
    await waitFor(() =>
      server.frames.some((f) => f.requestId === 'queued' && f.type === 'end'),
    );
    const frames = byRequest(server.frames, 'queued');
    expect(frames.map((f) => f.seq)).toEqual(frames.map((_, i) => i));

    connection.stop();
    await running;
  });

  it('fails with a clear error when the token is refused', async () => {
    const server = new FakeServer();
    server.rejectWith = 'invalid-runner-token';
    const { running } = connect(server, fakeOllama());

    await expect(running).rejects.toBeInstanceOf(RunnerAuthError);
    await expect(running).rejects.toThrow(/runner:start --reset/);
  });
});

describe('[runner] FrameSender', () => {
  it('numbers frames and merges consecutive chunks into one batch', async () => {
    const batches: RunnerResponseFrame[][] = [];
    const sender = new FrameSender(
      'r',
      async (frames) => batches.push(frames),
      1000,
    );
    sender.push({ type: 'ack' });
    sender.push({ type: 'chunk', data: 'a' });
    sender.push({ type: 'chunk', data: 'b' });
    sender.push({ type: 'end' });
    await sender.flush();

    expect(batches).toEqual([
      [
        { type: 'ack', requestId: 'r', seq: 0 },
        { type: 'chunk', data: 'ab', requestId: 'r', seq: 1 },
        { type: 'end', requestId: 'r', seq: 2 },
      ],
    ]);
  });
});

describe('[runner] urls', () => {
  it('derives the subscriptions endpoint from the `gcli login` API url', () => {
    expect(deriveSubscriptionsUrl('https://api.lambforge.com')).toBe(
      'wss://api.lambforge.com/subscriptions',
    );
    expect(deriveSubscriptionsUrl('http://localhost:9004/graphql')).toBe(
      'ws://localhost:9000/subscriptions',
    );
    expect(deriveSubscriptionsUrl('')).toBe(
      'wss://api.lambforge.com/subscriptions',
    );
  });

  it('accepts OLLAMA_HOST-style values', () => {
    expect(resolveOllamaUrl('0.0.0.0:11434')).toBe('http://127.0.0.1:11434');
    expect(resolveOllamaUrl('http://gpu-box:11434/')).toBe(
      'http://gpu-box:11434',
    );
  });
});

describe('[runner] runner:models selection flags', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { parseSelection } = require('../src/commands/runner/models');

  it('maps the flags to the selection to save', () => {
    expect(parseSelection({})).toBeNull();
    expect(parseSelection({ all: true })).toEqual({ models: null });
    expect(parseSelection({ none: true })).toEqual({ models: [] });
    expect(parseSelection({ show: 'qwen3.8:27b, gemma4:31b,' })).toEqual({
      models: ['qwen3.8:27b', 'gemma4:31b'],
    });
  });

  it('refuses conflicting flags', () => {
    expect(() => parseSelection({ all: true, none: true })).toThrow(/only one/);
  });
});
