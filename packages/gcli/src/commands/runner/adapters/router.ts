import { describeError, RunnerLogger } from '../tunnel';
import { LocalRunnerModel } from '../types';
import { ModelAdapter } from './types';

interface Route {
  adapter: ModelAdapter;
  /** The model's name on its own server. */
  upstream: string;
}

/**
 * Serves one runner from several model servers. The first adapter is the
 * primary: its models keep their own names (so a runner that only has Ollama
 * reports exactly what it always did). Every other adapter's models are
 * shown as `<adapter name>/<model>` - stable names for the chat picker and
 * `runner:models --show`, and no clashes between servers.
 */
export class ModelRouter {
  private readonly routes = new Map<string, Map<string, Route>>();
  private readonly reachable = new Map<string, boolean>();

  constructor(
    readonly adapters: ModelAdapter[],
    private readonly logger: RunnerLogger,
  ) {
    if (!adapters.length) {
      throw new Error('A runner needs at least one backend');
    }
    const names = adapters.map((a) => a.name);
    const dup = names.find((n, i) => names.indexOf(n) !== i);
    if (dup) {
      throw new Error(`Backend name "${dup}" is used twice`);
    }
  }

  get primary() {
    return this.adapters[0];
  }

  /** `strata/Qwen3` for a secondary adapter, the plain name for the primary. */
  exposedName(adapter: ModelAdapter, model: string) {
    return adapter === this.primary ? model : `${adapter.name}/${model}`;
  }

  /**
   * Every backend's models under their exposed names. A backend that can't be
   * reached contributes nothing this round (its models drop out of the
   * picker) without affecting the others; reachability changes are logged once.
   */
  async listModels(announce = false): Promise<LocalRunnerModel[]> {
    const perAdapter = await Promise.all(
      this.adapters.map(async (adapter) => {
        try {
          const models = await adapter.listModels();
          if (this.reachable.get(adapter.name) === false || announce) {
            this.logger.info(
              `${this.label(adapter)}: ${models.length} model(s)`,
            );
          }
          this.reachable.set(adapter.name, true);
          const routes = new Map<string, Route>();
          for (const model of models) {
            routes.set(this.exposedName(adapter, model.name), {
              adapter,
              upstream: model.name,
            });
          }
          this.routes.set(adapter.name, routes);
          return models.map((m) => ({
            ...m,
            name: this.exposedName(adapter, m.name),
          }));
        } catch (e) {
          if (this.reachable.get(adapter.name) !== false) {
            this.logger.warn(
              `Cannot reach ${this.label(adapter)} (${describeError(e)}). Is it running? Retrying...`,
            );
          }
          this.reachable.set(adapter.name, false);
          return [];
        }
      }),
    );
    const seen = new Set<string>();
    return perAdapter.flat().filter((m) => {
      // Only possible when a primary model is literally named "<backend>/...".
      if (seen.has(m.name)) {
        return false;
      }
      seen.add(m.name);
      return true;
    });
  }

  /** True when at least one backend answered the last `listModels`. */
  get anyReachable() {
    return [...this.reachable.values()].some(Boolean);
  }

  /**
   * Which backend serves `model`, and the request body with the model renamed
   * to the backend's own name. Unknown models (e.g. a request racing the first
   * heartbeat) go to the backend named by the prefix, else to the primary,
   * unchanged.
   */
  route(body?: string): {
    adapter: ModelAdapter;
    body?: string;
    model: string;
  } {
    let parsed: Record<string, unknown> | undefined;
    try {
      parsed = JSON.parse(body ?? '');
    } catch {
      parsed = undefined;
    }
    const model = typeof parsed?.model === 'string' ? parsed.model : undefined;
    if (!model) {
      return { adapter: this.primary, body, model: 'unknown model' };
    }
    const route = this.find(model);
    if (!route || route.upstream === model) {
      return { adapter: route?.adapter ?? this.primary, body, model };
    }
    return {
      adapter: route.adapter,
      body: JSON.stringify({ ...parsed, model: route.upstream }),
      model,
    };
  }

  label(adapter: ModelAdapter) {
    const kind = adapter.kind === adapter.name ? '' : ` (${adapter.kind})`;
    return `${adapter.name}${kind} at ${adapter.url}`;
  }

  private find(model: string): Route | undefined {
    for (const routes of this.routes.values()) {
      const route = routes.get(model);
      if (route) {
        return route;
      }
    }
    const adapter = this.adapters.find(
      (a) => a !== this.primary && model.startsWith(`${a.name}/`),
    );
    return adapter
      ? { adapter, upstream: model.slice(adapter.name.length + 1) }
      : undefined;
  }
}
