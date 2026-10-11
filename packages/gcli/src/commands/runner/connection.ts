import { isAllowedRequest, OllamaModels } from './ollama';
import { LocalRunner, RunnerRequest, RunnerResponseFrame } from './types';

/** The subset of the WHATWG WebSocket the connection uses (injectable for tests). */
export interface SocketLike {
  readyState: number;
  onopen: ((ev: unknown) => void) | null;
  onmessage: ((ev: { data: unknown }) => void) | null;
  onclose: ((ev: { code?: number; reason?: string }) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export interface RunnerLogger {
  log(...data: unknown[]): void;
  info(...data: unknown[]): void;
  warn(...data: unknown[]): void;
  error(...data: unknown[]): void;
}

export interface RunnerConnectionOptions {
  wsUrl: string;
  token: string;
  ollamaUrl: string;
  version: string;
  logger: RunnerLogger;
  createSocket?: (url: string, protocol: string) => SocketLike;
  fetchFn?: typeof fetch;
  heartbeatMs?: number;
  flushMs?: number;
  pingMs?: number;
  operationTimeoutMs?: number;
  maxReconnectDelayMs?: number;
}

const OPEN = 1;
const SUBSCRIPTION_ID = 'runner-requests';
// Larger pieces are split across frames so one GraphQL message stays small.
const MAX_CHUNK_CHARS = 32 * 1024;

const REQUESTS_SUBSCRIPTION = `subscription {
  subscribeToRunnerRequests { requestId type method path body }
}`;
const HEARTBEAT_MUTATION = `mutation runnerHeartbeat($models: [LocalRunnerModelInput], $runnerVersion: String) {
  runnerHeartbeat(models: $models, runnerVersion: $runnerVersion) { id name }
}`;
const RESPOND_MUTATION = `mutation runnerRespond($frames: [RunnerResponseFrameInput!]!) {
  runnerRespond(frames: $frames) { status }
}`;

export class RunnerAuthError extends Error {}

const describeError = (e: unknown) =>
  e instanceof Error ? e.message : String(e);

/**
 * Buffers one request's response frames and sends them in order: every frame
 * gets the next sequence number, consecutive body chunks are merged, and a
 * batch is sent at most every `flushMs` — so a model streaming 50 tokens/s
 * costs ~20 small mutations per second instead of 50.
 */
export class FrameSender {
  private seq = 0;
  private queue: RunnerResponseFrame[] = [];
  private timer?: ReturnType<typeof setTimeout>;
  private sending: Promise<void> = Promise.resolve();
  lastPushAt = Date.now();

  constructor(
    private requestId: string,
    private send: (frames: RunnerResponseFrame[]) => Promise<unknown>,
    private flushMs: number,
  ) {}

  push(frame: Omit<RunnerResponseFrame, 'requestId' | 'seq'>) {
    this.lastPushAt = Date.now();
    const last = this.queue[this.queue.length - 1];
    if (
      frame.type === 'chunk' &&
      last?.type === 'chunk' &&
      last.data.length + frame.data.length <= MAX_CHUNK_CHARS
    ) {
      last.data += frame.data;
    } else {
      this.queue.push({ ...frame, requestId: this.requestId, seq: this.seq++ });
    }
    if (!this.timer) {
      this.timer = setTimeout(() => void this.flush(), this.flushMs);
    }
  }

  flush(): Promise<void> {
    clearTimeout(this.timer);
    this.timer = undefined;
    const frames = this.queue.splice(0);
    if (frames.length) {
      // Sequential: a batch is only sent once the previous one was accepted.
      this.sending = this.sending
        .then(() => this.send(frames))
        .then(
          () => undefined,
          () => undefined,
        );
    }
    return this.sending;
  }
}

/**
 * Keeps this machine connected to Lambforge as a local runner and serves the
 * chat's model requests from the local Ollama.
 *
 * Speaks the subscriptions-transport-ws protocol the platform's
 * `/subscriptions` endpoint uses, authenticating with the runner token in the
 * connection params. The connection is outbound only, so it works from behind
 * NAT without exposing Ollama.
 */
export class RunnerConnection {
  private socket?: SocketLike;
  private stopped = false;
  private fatal?: Error;
  private nextOperationId = 1;
  private operations = new Map<
    string,
    {
      resolve: (data: unknown) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private activeRequests = new Map<string, AbortController>();
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private ollamaReachable?: boolean;
  private announcedModels = '';
  private readonly ollama: OllamaModels;
  private readonly fetchFn: typeof fetch;

  constructor(private options: RunnerConnectionOptions) {
    this.fetchFn = options.fetchFn ?? fetch;
    this.ollama = new OllamaModels(options.ollamaUrl, this.fetchFn);
  }

  /** Runs until `stop()`; rejects only when the token is refused. */
  async run(): Promise<void> {
    let attempt = 0;
    while (!this.stopped) {
      const connected = await this.connectOnce();
      if (this.fatal) {
        throw this.fatal;
      }
      if (this.stopped) {
        return;
      }
      attempt = connected ? 0 : attempt + 1;
      const delay = Math.min(
        this.options.maxReconnectDelayMs ?? 30_000,
        1000 * 2 ** attempt,
      );
      this.options.logger.warn(
        `Disconnected from Lambforge; reconnecting in ${Math.round(delay / 1000)}s...`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  stop() {
    this.stopped = true;
    this.socket?.close(1000, 'runner stopped');
  }

  /** Resolves when the socket closes; `true` if it got as far as being acknowledged. */
  private connectOnce(): Promise<boolean> {
    return new Promise((resolve) => {
      let acknowledged = false;
      const createSocket =
        this.options.createSocket ??
        ((url, protocol) => {
          if (typeof WebSocket === 'undefined') {
            throw new Error('gcli runner requires Node.js 22 or newer');
          }
          return new WebSocket(url, protocol) as unknown as SocketLike;
        });
      let socket: SocketLike;
      try {
        socket = createSocket(this.options.wsUrl, 'graphql-ws');
      } catch (e) {
        this.options.logger.error(describeError(e));
        resolve(false);
        return;
      }
      this.socket = socket;

      socket.onopen = () =>
        this.send({
          type: 'connection_init',
          payload: { runnerToken: this.options.token },
        });

      socket.onmessage = (event) => {
        let message: {
          id?: string;
          type: string;
          payload?: {
            data?: Record<string, unknown>;
            errors?: { message: string }[];
            message?: string;
          };
        };
        try {
          message = JSON.parse(String(event.data));
        } catch {
          return;
        }
        if (message.type === 'connection_ack') {
          acknowledged = true;
          void this.onConnected();
        } else if (message.type === 'connection_error') {
          const reason = message.payload?.message || 'connection refused';
          this.fatal = new RunnerAuthError(
            `Lambforge refused this runner (${reason}). The runner may have been deleted - re-register it with \`gcli runner:start --reset\`.`,
          );
          socket.close();
        } else if (message.id === SUBSCRIPTION_ID) {
          if (message.type === 'data') {
            const request = message.payload?.data
              ?.subscribeToRunnerRequests as RunnerRequest;
            if (request) {
              void this.onRequest(request);
            }
          } else if (message.type === 'error' || message.type === 'complete') {
            this.options.logger.error(
              `Request subscription ended: ${JSON.stringify(message.payload ?? {})}`,
            );
            socket.close();
          }
        } else if (message.id && this.operations.has(message.id)) {
          this.onOperationMessage(message.id, message.type, message.payload);
        }
      };

      socket.onerror = () => undefined;
      socket.onclose = () => {
        this.onDisconnected();
        resolve(acknowledged);
      };
    });
  }

  private async onConnected() {
    this.send({
      id: SUBSCRIPTION_ID,
      type: 'start',
      payload: { query: REQUESTS_SUBSCRIPTION },
    });
    const runner = await this.heartbeat(true).catch((e) => {
      this.options.logger.error(`Heartbeat failed: ${describeError(e)}`);
      return null;
    });
    if (runner) {
      this.options.logger.log(
        `Connected as "${runner.name}" (${runner.id}). Your local models are now available in the Lambforge chat.`,
      );
    }
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(
      () =>
        void this.heartbeat(false).catch((e) => {
          // A heartbeat that can't complete means the link is dead even if
          // the socket hasn't noticed — force a reconnect.
          this.options.logger.warn(`Heartbeat failed: ${describeError(e)}`);
          this.socket?.close();
        }),
      this.options.heartbeatMs ?? 30_000,
    );
  }

  private onDisconnected() {
    clearInterval(this.heartbeatTimer);
    for (const [id, op] of this.operations) {
      clearTimeout(op.timer);
      op.reject(new Error('connection closed'));
      this.operations.delete(id);
    }
    // Responses can't be delivered any more; stop the generations.
    for (const controller of this.activeRequests.values()) {
      controller.abort();
    }
    this.activeRequests.clear();
  }

  private async heartbeat(announce: boolean) {
    let models: unknown[] = [];
    try {
      models = await this.ollama.list();
      if (this.ollamaReachable === false || announce) {
        this.options.logger.info(
          `Ollama at ${this.options.ollamaUrl}: ${models.length} model(s)`,
        );
      }
      this.ollamaReachable = true;
    } catch (e) {
      if (this.ollamaReachable !== false) {
        this.options.logger.warn(
          `Cannot reach Ollama at ${this.options.ollamaUrl} (${describeError(e)}). Is it running? Retrying...`,
        );
      }
      this.ollamaReachable = false;
    }
    const names = JSON.stringify(
      models.map((m) => (m as { name: string }).name),
    );
    if (!announce && names !== this.announcedModels && this.ollamaReachable) {
      this.options.logger.info(
        `Models: ${models.map((m) => (m as { name: string }).name).join(', ') || '(none)'}`,
      );
    }
    this.announcedModels = names;
    const data = (await this.operation(HEARTBEAT_MUTATION, {
      models,
      runnerVersion: this.options.version,
    })) as { runnerHeartbeat: LocalRunner };
    return data?.runnerHeartbeat;
  }

  private async onRequest(request: RunnerRequest) {
    if (request.type === 'cancel') {
      this.activeRequests.get(request.requestId)?.abort();
      return;
    }
    const sender = new FrameSender(
      request.requestId,
      (frames) => this.operation(RESPOND_MUTATION, { frames }),
      this.options.flushMs ?? 50,
    );
    if (!isAllowedRequest(request.method, request.path)) {
      sender.push({
        type: 'error',
        error: `${request.method} ${request.path} is not allowed by this runner`,
      });
      await sender.flush();
      return;
    }

    const controller = new AbortController();
    this.activeRequests.set(request.requestId, controller);
    sender.push({ type: 'ack' });
    void sender.flush();
    // Ollama queues concurrent requests (several spawned agent workers on one
    // GPU) and sends nothing until it starts on ours; keep the backend's idle
    // timer from expiring meanwhile.
    const pingMs = this.options.pingMs ?? 30_000;
    const ping = setInterval(() => {
      if (Date.now() - sender.lastPushAt >= pingMs) {
        sender.push({ type: 'ping' });
        void sender.flush();
      }
    }, pingMs);

    const started = Date.now();
    const model = this.modelOf(request.body);
    this.options.logger.info(`-> chat request (${model})`);

    try {
      const response = await this.fetchFn(
        `${this.options.ollamaUrl}${request.path}`,
        {
          method: request.method,
          headers: { 'Content-Type': 'application/json' },
          body: request.body,
          signal: controller.signal,
        },
      );
      sender.push({
        type: 'head',
        status: response.status,
        data: response.headers.get('content-type') ?? undefined,
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const text = decoder.decode(value, { stream: true });
        if (text) {
          sender.push({ type: 'chunk', data: text });
        }
      }
      const tail = decoder.decode();
      if (tail) {
        sender.push({ type: 'chunk', data: tail });
      }
      sender.push({ type: 'end' });
      this.options.logger.info(
        `<- ${response.status} (${model}) in ${((Date.now() - started) / 1000).toFixed(1)}s`,
      );
    } catch (e) {
      if (controller.signal.aborted) {
        this.options.logger.info(`x  cancelled (${model})`);
      } else {
        const reason = describeError(e);
        this.options.logger.error(`x  ${reason}`);
        sender.push({
          type: 'error',
          error: /fetch failed|ECONNREFUSED/.test(reason)
            ? `Could not reach Ollama at ${this.options.ollamaUrl} on the runner machine - is it running?`
            : reason,
        });
      }
    } finally {
      clearInterval(ping);
      this.activeRequests.delete(request.requestId);
      await sender.flush();
    }
  }

  private modelOf(body?: string) {
    try {
      return JSON.parse(body ?? '{}').model ?? 'unknown model';
    } catch {
      return 'unknown model';
    }
  }

  private operation(query: string, variables: Record<string, unknown>) {
    const id = String(this.nextOperationId++);
    return new Promise<unknown>((resolve, reject) => {
      if (this.socket?.readyState !== OPEN) {
        reject(new Error('not connected'));
        return;
      }
      const timer = setTimeout(() => {
        this.operations.delete(id);
        reject(new Error('timed out waiting for Lambforge'));
      }, this.options.operationTimeoutMs ?? 20_000);
      this.operations.set(id, { resolve, reject, timer });
      this.send({ id, type: 'start', payload: { query, variables } });
    });
  }

  private onOperationMessage(
    id: string,
    type: string,
    payload?: {
      data?: Record<string, unknown>;
      errors?: { message: string }[];
      message?: string;
    },
  ) {
    const op = this.operations.get(id);
    this.operations.delete(id);
    clearTimeout(op.timer);
    if (type === 'data' && !payload?.errors?.length) {
      op.resolve(payload?.data);
    } else if (type === 'complete') {
      op.resolve(undefined);
    } else {
      op.reject(
        new Error(
          payload?.errors?.map((e) => e.message).join('; ') ||
            payload?.message ||
            'operation failed',
        ),
      );
    }
  }

  private send(message: Record<string, unknown>) {
    if (this.socket?.readyState === OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}
