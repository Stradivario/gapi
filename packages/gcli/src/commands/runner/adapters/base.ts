import { LocalRunnerModel } from '../types';
import { AdapterDeps, AdapterSpec, ModelAdapter } from './types';

/**
 * Shared plumbing: base URL normalisation, the optional bearer key, and a
 * plain pass-through `forward` (both built-in servers speak the OpenAI chat
 * API natively). An adapter for a server with another chat API overrides
 * `forward` and translates the request/stream.
 */
export abstract class HttpModelAdapter implements ModelAdapter {
  readonly name: string;
  readonly kind: string;
  readonly url: string;
  protected readonly fetchFn: typeof fetch;
  private readonly apiKey?: string;

  constructor(spec: AdapterSpec, deps: AdapterDeps = {}) {
    this.name = spec.name;
    this.kind = spec.kind;
    this.url = spec.url.replace(/\/+$/, '');
    this.apiKey = spec.apiKey;
    this.fetchFn = deps.fetchFn ?? fetch;
  }

  abstract listModels(): Promise<LocalRunnerModel[]>;

  forward(
    method: string,
    path: string,
    body: string | undefined,
    signal: AbortSignal,
  ) {
    return this.fetchFn(`${this.url}${path}`, {
      method,
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body,
      signal,
    });
  }

  protected headers(extra: Record<string, string> = {}) {
    return this.apiKey
      ? { ...extra, Authorization: `Bearer ${this.apiKey}` }
      : extra;
  }
}
