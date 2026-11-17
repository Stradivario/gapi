import { LocalRunnerModel } from '../types';
import { HttpModelAdapter } from './base';

interface OpenAIModel {
  id?: string;
  // llama.cpp's llama-server (and engines built on it, e.g. Strata):
  // n_ctx_train = the model's max, n_ctx = the window it is loaded with
  meta?: { n_ctx_train?: number; n_ctx?: number; n_params?: number };
  // llama.cpp: other ids this same model answers to (listed again as entries)
  aliases?: string[];
  architecture?: { input_modalities?: string[] };
  // vLLM
  max_model_len?: number;
  // LM Studio and others
  context_length?: number;
}

interface LlamaProps {
  n_ctx?: number;
  default_generation_settings?: { n_ctx?: number };
  chat_template_caps?: {
    supports_tools?: boolean;
    supports_tool_calls?: boolean;
  };
  modalities?: { vision?: boolean };
}

const formatParams = (n?: number) =>
  typeof n === 'number' && n > 0
    ? `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`
    : undefined;

const num = (v: unknown) => (typeof v === 'number' && v > 0 ? v : undefined);

/**
 * Any OpenAI-compatible server: Strata, llama.cpp's llama-server, LM Studio,
 * vLLM, ... Models from `GET /v1/models`; llama.cpp's `GET /props` (optional -
 * other servers just 404) adds the running context window and what the chat
 * template supports. Capabilities:
 *  - `/props` answered: `completion`, plus `tools` when the template supports
 *    tool calls and `vision` when the server takes images - the same names
 *    Ollama uses, so the web app labels them the same way;
 *  - no `/props`: unknown (`[]`), which the backend treats as tool-capable.
 * Alias entries (llama.cpp lists one model again under each alias) are
 * dropped, so each model appears once in the chat picker.
 */
export class OpenAIAdapter extends HttpModelAdapter {
  async listModels(): Promise<LocalRunnerModel[]> {
    const res = await this.fetchFn(`${this.url}/v1/models`, {
      headers: this.headers(),
    });
    if (!res.ok) {
      throw new Error(`/v1/models returned ${res.status}`);
    }
    const { data = [] } = (await res.json()) as { data?: OpenAIModel[] };
    const props = await this.props();
    const models = data.filter((m) => typeof m.id === 'string' && m.id);
    // First entry of each model wins; a later entry whose id is an alias of
    // (or names as its alias) one already kept is the same model again.
    const kept: OpenAIModel[] = [];
    const claimed = new Set<string>();
    for (const m of models) {
      const names = [m.id, ...(m.aliases ?? [])];
      if (names.some((n) => claimed.has(n))) {
        continue;
      }
      kept.push(m);
      names.forEach((n) => claimed.add(n));
    }
    return kept.map((m) => {
      const runtime =
        num(m.max_model_len) ??
        num(m.meta?.n_ctx) ??
        this.runningContext(props);
      return {
        name: m.id,
        parameterSize: formatParams(m.meta?.n_params),
        capabilities: this.capabilities(m, props),
        contextLength:
          num(m.meta?.n_ctx_train) ??
          num(m.context_length) ??
          num(m.max_model_len),
        // A llama.cpp server serves exactly one model, so /props applies to it.
        ...(runtime ? { runtimeContextLength: runtime } : {}),
      };
    });
  }

  private capabilities(model: OpenAIModel, props?: LlamaProps) {
    if (!props) {
      return [];
    }
    const caps = ['completion'];
    const tpl = props.chat_template_caps;
    if (tpl?.supports_tools || tpl?.supports_tool_calls) {
      caps.push('tools');
    }
    if (
      props.modalities?.vision ||
      model.architecture?.input_modalities?.includes('image')
    ) {
      caps.push('vision');
    }
    return caps;
  }

  private runningContext(props?: LlamaProps) {
    return num(props?.default_generation_settings?.n_ctx) ?? num(props?.n_ctx);
  }

  private async props(): Promise<LlamaProps | undefined> {
    try {
      const res = await this.fetchFn(`${this.url}/props`, {
        headers: this.headers(),
      });
      return res.ok ? ((await res.json()) as LlamaProps) : undefined;
    } catch {
      return undefined;
    }
  }
}
