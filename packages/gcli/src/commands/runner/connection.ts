import { createAdapter } from './adapters/registry';
import { ModelRouter } from './adapters/router';
import { AdapterSpec, ModelAdapter } from './adapters/types';
import { isAllowedRequest } from './ollama';
import {
  describeError,
  FrameSender,
  RunnerAuthError,
  RunnerLogger,
  SocketLike,
  TunnelConnection,
} from './tunnel';
import { LocalRunner, RunnerRequest } from './types';

export { FrameSender, RunnerAuthError, RunnerLogger, SocketLike };

export interface RunnerConnectionOptions {
  wsUrl: string;
  token: string;
  /** Model servers to serve from; the first is the primary (see ModelRouter). */
  backends?: AdapterSpec[];
  /** Ready-made adapters (tests, embedding); wins over `backends`. */
  adapters?: ModelAdapter[];
  /** Shorthand for a single Ollama backend (the pre-adapter option). */
  ollamaUrl?: string;
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

const HEARTBEAT_MUTATION = `mutation runnerHeartbeat($models: [LocalRunnerModelInput], $runnerVersion: String) {
  runnerHeartbeat(models: $models, runnerVersion: $runnerVersion) { id name }
}`;

/**
 * Keeps this machine connected to Lambforge as a local runner and serves the
 * chat's model requests from the local model servers (Ollama, Strata or any
 * other registered adapter - see `adapters/`). The connection is outbound
 * only, so it works from behind NAT without exposing any of them.
 */
export class RunnerConnection extends TunnelConnection<LocalRunner> {
  private announcedModels = '';
  readonly router: ModelRouter;

  constructor(private options: RunnerConnectionOptions) {
    super(options);
    const fetchFn = options.fetchFn ?? fetch;
    const specs: AdapterSpec[] = options.backends?.length
      ? options.backends
      : [
          {
            name: 'ollama',
            kind: 'ollama',
            url: options.ollamaUrl ?? 'http://127.0.0.1:11434',
          },
        ];
    this.router = new ModelRouter(
      options.adapters?.length
        ? options.adapters
        : specs.map((spec) => createAdapter(spec, { fetchFn })),
      options.logger,
    );
  }

  protected connectionParams() {
    return { runnerToken: this.options.token };
  }

  protected authError(reason: string) {
    return new RunnerAuthError(
      `Lambforge refused this runner (${reason}). The runner may have been deleted - re-register it with \`gcli runner:start --reset\`.`,
    );
  }

  protected onIdentified(runner: LocalRunner) {
    this.options.logger.log(
      `Connected as "${runner.name}" (${runner.id}). Your local models are now available in the Lambforge chat.`,
    );
  }

  protected async heartbeat(announce: boolean) {
    const models = await this.router.listModels(announce);
    const names = JSON.stringify(models.map((m) => m.name));
    if (
      !announce &&
      names !== this.announcedModels &&
      this.router.anyReachable
    ) {
      this.options.logger.info(
        `Models: ${models.map((m) => m.name).join(', ') || '(none)'}`,
      );
    }
    this.announcedModels = names;
    const data = (await this.operation(HEARTBEAT_MUTATION, {
      models,
      runnerVersion: this.options.version,
    })) as { runnerHeartbeat: LocalRunner };
    return data?.runnerHeartbeat;
  }

  protected refuse(request: RunnerRequest) {
    return isAllowedRequest(request.method, request.path)
      ? null
      : `${request.method} ${request.path} is not allowed by this runner`;
  }

  protected async serve(
    request: RunnerRequest,
    sender: FrameSender,
    signal: AbortSignal,
  ) {
    const started = Date.now();
    const { adapter, body, model } = this.router.route(request.body);
    const via = this.router.adapters.length > 1 ? ` via ${adapter.name}` : '';
    this.options.logger.info(`-> chat request (${model})${via}`);

    try {
      const response = await adapter.forward(
        request.method,
        request.path,
        body,
        signal,
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
      if (signal.aborted) {
        this.options.logger.info(`x  cancelled (${model})`);
      } else {
        const reason = describeError(e);
        this.options.logger.error(`x  ${reason}`);
        sender.push({
          type: 'error',
          error: /fetch failed|ECONNREFUSED/.test(reason)
            ? `Could not reach ${this.router.label(adapter)} on the runner machine - is it running?`
            : reason,
        });
      }
    }
  }
}
