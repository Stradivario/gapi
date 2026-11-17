import { OllamaAdapter } from './ollama';
import { OpenAIAdapter } from './openai';
import {
  AdapterDeps,
  AdapterFactory,
  AdapterSpec,
  ModelAdapter,
} from './types';

const factories = new Map<string, AdapterFactory>();

/**
 * Makes a new kind of model server available to `--backend <name>=<kind>:<url>`.
 * A new adapter = one class implementing `ModelAdapter` + one call here.
 */
export const registerAdapter = (kind: string, factory: AdapterFactory) => {
  factories.set(kind.toLowerCase(), factory);
};

export const adapterKinds = () => [...factories.keys()];

export const hasAdapterKind = (kind: string) =>
  factories.has(kind?.toLowerCase());

export const createAdapter = (
  spec: AdapterSpec,
  deps: AdapterDeps = {},
): ModelAdapter => {
  const factory = factories.get(spec.kind?.toLowerCase());
  if (!factory) {
    throw new Error(
      `Unknown backend kind "${spec.kind}" for "${spec.name}" (known: ${adapterKinds().join(', ')})`,
    );
  }
  return factory(spec, deps);
};

registerAdapter('ollama', (spec, deps) => new OllamaAdapter(spec, deps));
registerAdapter('openai', (spec, deps) => new OpenAIAdapter(spec, deps));
