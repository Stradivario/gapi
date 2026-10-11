import { LocalRunnerModel } from './types';

// The only Ollama endpoints the platform may reach through this runner. The
// backend has its own copy of this list; both must allow a path for it to work.
export const ALLOWED_REQUESTS = [
  { method: 'POST', path: '/v1/chat/completions' },
];

export const isAllowedRequest = (method: string, path: string) =>
  ALLOWED_REQUESTS.some(
    (r) => r.method === method?.toUpperCase() && r.path === path,
  );

export const resolveOllamaUrl = (option?: string) => {
  const raw = option || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
  // OLLAMA_HOST is often set without a scheme ("0.0.0.0:11434").
  const withScheme = /^https?:\/\//.test(raw) ? raw : `http://${raw}`;
  const url = new URL(withScheme);
  // 0.0.0.0 is a bind address, not something to connect to.
  if (url.hostname === '0.0.0.0') {
    url.hostname = '127.0.0.1';
  }
  return url.origin;
};

interface OllamaTag {
  name: string;
  digest?: string;
  details?: {
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

interface OllamaShow {
  capabilities?: string[];
  model_info?: Record<string, unknown>;
}

/**
 * Discovers the models installed in the local Ollama. `/api/show` results are
 * cached per digest, so the periodic refresh only costs one `/api/tags` call
 * unless a model was pulled or changed.
 */
export class OllamaModels {
  private showCache = new Map<string, OllamaShow>();

  constructor(
    private baseUrl: string,
    private fetchFn: typeof fetch = fetch,
  ) {}

  async list(): Promise<LocalRunnerModel[]> {
    const res = await this.fetchFn(`${this.baseUrl}/api/tags`);
    if (!res.ok) {
      throw new Error(`Ollama /api/tags returned ${res.status}`);
    }
    const { models = [] } = (await res.json()) as { models?: OllamaTag[] };
    const described = await Promise.all(
      models.map((tag) => this.describe(tag)),
    );
    // Image-generation and embedding-only models can't answer a chat. Models
    // with unknown capabilities (older Ollama) are kept.
    return described.filter(
      (m) => !m.capabilities.length || m.capabilities.includes('completion'),
    );
  }

  private async describe(tag: OllamaTag): Promise<LocalRunnerModel> {
    const show = await this.show(tag);
    const contextLength = Object.entries(show?.model_info ?? {}).find(([key]) =>
      key.endsWith('.context_length'),
    )?.[1];
    return {
      name: tag.name,
      family: tag.details?.family,
      parameterSize: tag.details?.parameter_size,
      quantization: tag.details?.quantization_level,
      capabilities: show?.capabilities ?? [],
      contextLength:
        typeof contextLength === 'number' ? contextLength : undefined,
    };
  }

  private async show(tag: OllamaTag): Promise<OllamaShow | undefined> {
    const key = tag.digest || tag.name;
    if (this.showCache.has(key)) {
      return this.showCache.get(key);
    }
    try {
      const res = await this.fetchFn(`${this.baseUrl}/api/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: tag.name }),
      });
      if (!res.ok) {
        return undefined;
      }
      const show = (await res.json()) as OllamaShow;
      this.showCache.set(key, show);
      return show;
    } catch {
      // Older Ollama without capabilities: the model is still listed, just
      // treated as tool-capable by the backend.
      return undefined;
    }
  }
}
