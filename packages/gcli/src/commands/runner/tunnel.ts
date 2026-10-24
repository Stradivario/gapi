import { RunnerRequest, RunnerResponseFrame } from './types';

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

export interface TunnelConnectionOptions {
  wsUrl: string;
  logger: RunnerLogger;
  createSocket?: (url: string, protocol: string) => SocketLike;
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
const RESPOND_MUTATION = `mutation runnerRespond($frames: [RunnerResponseFrameInput!]!) {
  runnerRespond(frames: $frames) { status }
}`;

export class RunnerAuthError extends Error {}

export const describeError = (e: unknown) =>
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

  /** A whole body as head + chunks + end (split to keep frames small). */
  pushBody(status: number, contentType: string, body: string) {
    this.push({ type: 'head', status, data: contentType });
    for (let i = 0; i < body.length; i += MAX_CHUNK_CHARS) {
      this.push({ type: 'chunk', data: body.slice(i, i + MAX_CHUNK_CHARS) });
    }
    this.push({ type: 'end' });
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
 * An outbound connection to the Lambforge `/subscriptions` endpoint that
 * serves the backend's tunnelled requests (LocalRunnerTunnelService): the
 * local AI runner (Ollama) and the local workspace (files + commands) are
 * both one of these.
 *
 * Speaks subscriptions-transport-ws, authenticates with the connection params
 * of the subclass, receives requests through `subscribeToRunnerRequests` and
 * answers with `runnerRespond`. Outbound only, so it works behind NAT.
 */
export abstract class TunnelConnection<Identity = unknown> {
  protected socket?: SocketLike;
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
  protected activeRequests = new Map<string, AbortController>();
  private heartbeatTimer?: ReturnType<typeof setInterval>;

  constructor(protected baseOptions: TunnelConnectionOptions) {}

  /** `connection_init` payload (the token). */
  protected abstract connectionParams(): Record<string, unknown>;
  /** Error for a refused token. */
  protected abstract authError(reason: string): Error;
  /** Reports liveness; `announce` on (re)connect. Returns the identity. */
  protected abstract heartbeat(announce: boolean): Promise<Identity>;
  /** Logged once the first heartbeat after a (re)connect succeeded. */
  protected abstract onIdentified(identity: Identity): void;
  /** An error string when the request must be refused before it is acked. */
  protected abstract refuse(request: RunnerRequest): string | null;
  /** Serves one request: push head/chunk/end (or error) frames. */
  protected abstract serve(
    request: RunnerRequest,
    sender: FrameSender,
    signal: AbortSignal,
  ): Promise<void>;
  /** A non-request frame (e.g. an approval decision). */
  protected onNotice(request: RunnerRequest): void {
    void request;
  }
  /** The socket went away (requests were already aborted). */
  protected onConnectionLost(): void {}

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
        this.baseOptions.maxReconnectDelayMs ?? 30_000,
        1000 * 2 ** attempt,
      );
      this.baseOptions.logger.warn(
        `Disconnected from Lambforge; reconnecting in ${Math.round(delay / 1000)}s...`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  stop() {
    this.stopped = true;
    this.socket?.close(1000, 'stopped');
  }

  /** Resolves when the socket closes; `true` if it got as far as being acknowledged. */
  private connectOnce(): Promise<boolean> {
    return new Promise((resolve) => {
      let acknowledged = false;
      const createSocket =
        this.baseOptions.createSocket ??
        ((url, protocol) => {
          if (typeof WebSocket === 'undefined') {
            throw new Error(
              'gcli requires Node.js 22 or newer for this command',
            );
          }
          return new WebSocket(url, protocol) as unknown as SocketLike;
        });
      let socket: SocketLike;
      try {
        socket = createSocket(this.baseOptions.wsUrl, 'graphql-ws');
      } catch (e) {
        this.baseOptions.logger.error(describeError(e));
        resolve(false);
        return;
      }
      this.socket = socket;

      socket.onopen = () =>
        this.send({
          type: 'connection_init',
          payload: this.connectionParams(),
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
          this.fatal = this.authError(reason);
          socket.close();
        } else if (message.id === SUBSCRIPTION_ID) {
          if (message.type === 'data') {
            const request = message.payload?.data
              ?.subscribeToRunnerRequests as RunnerRequest;
            if (request) {
              void this.onRequest(request);
            }
          } else if (message.type === 'error' || message.type === 'complete') {
            this.baseOptions.logger.error(
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
    const identity = await this.heartbeat(true).catch((e) => {
      this.baseOptions.logger.error(`Heartbeat failed: ${describeError(e)}`);
      return null;
    });
    if (identity) {
      this.onIdentified(identity);
    }
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(
      () =>
        void this.heartbeat(false).catch((e) => {
          // A heartbeat that can't complete means the link is dead even if
          // the socket hasn't noticed — force a reconnect.
          this.baseOptions.logger.warn(`Heartbeat failed: ${describeError(e)}`);
          this.socket?.close();
        }),
      this.baseOptions.heartbeatMs ?? 30_000,
    );
  }

  private onDisconnected() {
    clearInterval(this.heartbeatTimer);
    for (const [id, op] of this.operations) {
      clearTimeout(op.timer);
      op.reject(new Error('connection closed'));
      this.operations.delete(id);
    }
    // Responses can't be delivered any more; stop the work.
    for (const controller of this.activeRequests.values()) {
      controller.abort();
    }
    this.activeRequests.clear();
    this.onConnectionLost();
  }

  private async onRequest(request: RunnerRequest) {
    if (request.type === 'cancel') {
      this.activeRequests.get(request.requestId)?.abort();
      return;
    }
    if (request.type !== 'request') {
      this.onNotice(request);
      return;
    }
    const sender = new FrameSender(
      request.requestId,
      (frames) => this.operation(RESPOND_MUTATION, { frames }),
      this.baseOptions.flushMs ?? 50,
    );
    const refusal = this.refuse(request);
    if (refusal) {
      sender.push({ type: 'error', error: refusal });
      await sender.flush();
      return;
    }

    const controller = new AbortController();
    this.activeRequests.set(request.requestId, controller);
    sender.push({ type: 'ack' });
    void sender.flush();
    // The work may send nothing for a long time (Ollama queueing a request,
    // a command waiting for approval or running `npm install`); keep the
    // backend's idle timer from expiring meanwhile.
    const pingMs = this.baseOptions.pingMs ?? 30_000;
    const ping = setInterval(() => {
      if (Date.now() - sender.lastPushAt >= pingMs) {
        sender.push({ type: 'ping' });
        void sender.flush();
      }
    }, pingMs);

    try {
      await this.serve(request, sender, controller.signal);
    } finally {
      clearInterval(ping);
      this.activeRequests.delete(request.requestId);
      await sender.flush();
    }
  }

  protected operation(query: string, variables: Record<string, unknown>) {
    const id = String(this.nextOperationId++);
    return new Promise<unknown>((resolve, reject) => {
      if (this.socket?.readyState !== OPEN) {
        reject(new Error('not connected'));
        return;
      }
      const timer = setTimeout(() => {
        this.operations.delete(id);
        reject(new Error('timed out waiting for Lambforge'));
      }, this.baseOptions.operationTimeoutMs ?? 20_000);
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
