import { LocalRunnerModel } from '../types';

/**
 * One model server the runner can serve the chat from (Ollama, an
 * OpenAI-compatible server such as Strata / llama-server / LM Studio / vLLM,
 * ...). The wire format between Lambforge and the runner is always the
 * OpenAI chat API (`POST /v1/chat/completions`); an adapter only owns what
 * differs per server: discovering its models and forwarding a chat request.
 */
export interface ModelAdapter {
  /** Unique within the runner, e.g. "ollama" or "strata". */
  readonly name: string;
  /** The registered adapter kind, e.g. "ollama" or "openai". */
  readonly kind: string;
  /** Base URL (origin), for logs. */
  readonly url: string;
  /**
   * The chat-capable models this server has right now, under the server's own
   * names. Throws when the server can't be reached.
   */
  listModels(): Promise<LocalRunnerModel[]>;
  /**
   * Forwards one allowed request (see `ALLOWED_REQUESTS`) and returns the
   * server's response, streamed. `body.model` is already the server's own name.
   */
  forward(
    method: string,
    path: string,
    body: string | undefined,
    signal: AbortSignal,
  ): Promise<Response>;
}

/** How a backend is configured (`--backend`, saved in runner.json). */
export interface AdapterSpec {
  name: string;
  kind: string;
  url: string;
  /** Sent as `Authorization: Bearer <apiKey>`. Never logged. */
  apiKey?: string;
}

export interface AdapterDeps {
  fetchFn?: typeof fetch;
}

export type AdapterFactory = (
  spec: AdapterSpec,
  deps: AdapterDeps,
) => ModelAdapter;
