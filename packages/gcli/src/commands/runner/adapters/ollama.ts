import { OllamaModels } from '../ollama';
import { HttpModelAdapter } from './base';
import { AdapterDeps, AdapterSpec } from './types';

/**
 * Ollama: models from `/api/tags` + `/api/show` (capabilities, max context)
 * + `/api/ps` (the context a loaded model runs with) - see `OllamaModels`.
 * Chat goes to Ollama's own OpenAI-compatible `/v1/chat/completions`.
 */
export class OllamaAdapter extends HttpModelAdapter {
  private readonly models: OllamaModels;

  constructor(spec: AdapterSpec, deps: AdapterDeps = {}) {
    super(spec, deps);
    this.models = new OllamaModels(this.url, this.fetchFn);
  }

  listModels() {
    return this.models.list();
  }
}
