import { isAllowedRequest, OllamaModels } from './ollama';
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

const HEARTBEAT_MUTATION = `mutation runnerHeartbeat($models: [LocalRunnerModelInput], $runnerVersion: String) {
  runnerHeartbeat(models: $models, runnerVersion: $runnerVersion) { id name }
}`;

/**
 * Keeps this machine connected to Lambforge as a local runner and serves the
 * chat's model requests from the local Ollama. The connection is outbound
 * only, so it works from behind NAT without exposing Ollama.
 */
export class RunnerConnection extends TunnelConnection<LocalRunner> {
  private ollamaReachable?: boolean;
  private announcedModels = '';
  private readonly ollama: OllamaModels;
  private readonly fetchFn: typeof fetch;

  constructor(private options: RunnerConnectionOptions) {
    super(options);
    this.fetchFn = options.fetchFn ?? fetch;
    this.ollama = new OllamaModels(options.ollamaUrl, this.fetchFn);
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
    const model = this.modelOf(request.body);
    this.options.logger.info(`-> chat request (${model})`);

    try {
      const response = await this.fetchFn(
        `${this.options.ollamaUrl}${request.path}`,
        {
          method: request.method,
          headers: { 'Content-Type': 'application/json' },
          body: request.body,
          signal,
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
      if (signal.aborted) {
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
    }
  }

  private modelOf(body?: string) {
    try {
      return JSON.parse(body ?? '{}').model ?? 'unknown model';
    } catch {
      return 'unknown model';
    }
  }
}
