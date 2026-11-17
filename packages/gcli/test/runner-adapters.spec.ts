/* eslint-disable @typescript-eslint/no-explicit-any */
import 'jest';

import { OpenAIAdapter } from '../src/commands/runner/adapters/openai';
import {
  adapterKinds,
  createAdapter,
  registerAdapter,
} from '../src/commands/runner/adapters/registry';
import { ModelRouter } from '../src/commands/runner/adapters/router';
import {
  apiKeyEnvVar,
  describeBackends,
  parseBackendSpec,
  resolveBackends,
} from '../src/commands/runner/adapters/spec';
import { ModelAdapter } from '../src/commands/runner/adapters/types';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const silentLogger = { log() {}, info() {}, warn() {}, error() {} };

describe('[runner:adapters] --backend parsing', () => {
  it('reads <name>=<kind>:<url>', () => {
    expect(parseBackendSpec('strata=openai:http://127.0.0.1:8080')).toEqual({
      name: 'strata',
      kind: 'openai',
      url: 'http://127.0.0.1:8080',
    });
    expect(parseBackendSpec('strata=openai:127.0.0.1:8080/')).toEqual({
      name: 'strata',
      kind: 'openai',
      url: 'http://127.0.0.1:8080',
    });
  });

  it('uses the name as the kind when no kind is given', () => {
    expect(parseBackendSpec('ollama=0.0.0.0:11434')).toEqual({
      name: 'ollama',
      kind: 'ollama',
      url: 'http://127.0.0.1:11434',
    });
    expect(parseBackendSpec('ollama=gpu-box:11434')).toMatchObject({
      kind: 'ollama',
      url: 'http://gpu-box:11434',
    });
  });

  it('keeps a path prefix', () => {
    expect(parseBackendSpec('lm=openai:http://box:1234/api/').url).toBe(
      'http://box:1234/api',
    );
  });

  it('refuses bad values with a hint', () => {
    expect(() => parseBackendSpec('http://127.0.0.1:8080')).toThrow(
      /<name>=<kind>:<url>/,
    );
    expect(() => parseBackendSpec('strata=http://127.0.0.1:8080')).toThrow(
      /unknown kind "strata"/,
    );
    expect(() => parseBackendSpec('my box=openai:http://x')).toThrow(
      /letters, digits/,
    );
    expect(() => parseBackendSpec('strata=openai:')).toThrow(/missing URL/);
  });
});

describe('[runner:adapters] resolving the backends', () => {
  it('defaults to one Ollama, as before adapters', () => {
    expect(resolveBackends({}, undefined, {})).toEqual([
      { name: 'ollama', kind: 'ollama', url: 'http://127.0.0.1:11434' },
    ]);
    expect(resolveBackends({}, undefined, { OLLAMA_HOST: 'box:1' })).toEqual([
      { name: 'ollama', kind: 'ollama', url: 'http://box:1' },
    ]);
  });

  it('puts --ollama first next to --backend', () => {
    const specs = resolveBackends(
      {
        ollama: 'http://127.0.0.1:11434',
        backend: ['strata=openai:http://127.0.0.1:8080'],
      },
      undefined,
      {},
    );
    expect(specs.map((s) => s.name)).toEqual(['ollama', 'strata']);
  });

  it('uses the saved backends unless flags say otherwise', () => {
    const saved = [
      { name: 'ollama', kind: 'ollama', url: 'http://127.0.0.1:11434' },
      {
        name: 'strata',
        kind: 'openai',
        url: 'http://127.0.0.1:8080',
        apiKey: 'saved',
      },
    ];
    expect(resolveBackends({}, saved, {})).toEqual(saved);
    // --ollama alone = the classic single-Ollama runner (what old units run)
    expect(
      resolveBackends({ ollama: 'http://127.0.0.1:11434' }, saved, {}),
    ).toHaveLength(1);
  });

  it('takes keys from --backend-key, then $<NAME>_API_KEY, then the saved one', () => {
    const backend = ['strata=openai:http://127.0.0.1:8080'];
    expect(apiKeyEnvVar('my-strata')).toBe('MY_STRATA_API_KEY');
    expect(
      resolveBackends({ backend, backendKey: ['strata=flag'] }, undefined, {
        STRATA_API_KEY: 'env',
      })[0].apiKey,
    ).toBe('flag');
    expect(
      resolveBackends({ backend }, undefined, { STRATA_API_KEY: 'env' })[0]
        .apiKey,
    ).toBe('env');
    expect(() =>
      resolveBackends({ backend, backendKey: ['nope=k'] }, undefined, {}),
    ).toThrow(/no backend named "nope"/);
  });

  it('never prints a key', () => {
    expect(
      describeBackends([
        {
          name: 'strata',
          kind: 'openai',
          url: 'http://127.0.0.1:8080',
          apiKey: 'sk-secret',
        },
      ]),
    ).toBe('strata (openai) http://127.0.0.1:8080 [key]');
  });
});

describe('[runner:adapters] OpenAI-compatible servers (Strata, llama-server, ...)', () => {
  it('lists /v1/models with the running context from /props, sending the key', async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchFn = (async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      if (url.endsWith('/v1/models')) {
        return json({
          object: 'list',
          data: [
            {
              id: 'Qwen3.8-Flash-Next-IQ3_S',
              meta: { n_ctx_train: 262144, n_params: 35_200_000_000 },
            },
          ],
        });
      }
      if (url.endsWith('/props')) {
        return json({ default_generation_settings: { n_ctx: 131072 } });
      }
      return json({}, 404);
    }) as typeof fetch;
    const adapter = new OpenAIAdapter(
      {
        name: 'strata',
        kind: 'openai',
        url: 'http://127.0.0.1:8080/',
        apiKey: 'sk-1',
      },
      { fetchFn },
    );

    expect(await adapter.listModels()).toEqual([
      {
        name: 'Qwen3.8-Flash-Next-IQ3_S',
        parameterSize: '35B',
        // /props answered but says nothing about tools
        capabilities: ['completion'],
        contextLength: 262144,
        runtimeContextLength: 131072,
      },
    ]);
    expect(calls[0].url).toBe('http://127.0.0.1:8080/v1/models');
    expect((calls[0].init.headers as any).Authorization).toBe('Bearer sk-1');
  });

  it('reads Strata: tools + vision from /props, one entry per model (aliases dropped)', async () => {
    const entry = (id: string, aliases: string[]) => ({
      id,
      object: 'model',
      meta: { n_ctx: 131072 },
      architecture: { input_modalities: ['text', 'image'] },
      aliases,
    });
    const fetchFn = (async (url: string) =>
      url.endsWith('/v1/models')
        ? json({
            data: [
              entry('qwen3.8-flash-next-iq3_s', ['iq3_s']),
              entry('iq3_s', ['qwen3.8-flash-next-iq3_s']),
            ],
          })
        : json({
            default_generation_settings: { n_ctx: 131072 },
            chat_template_caps: {
              supports_tools: true,
              supports_tool_calls: true,
            },
            modalities: { vision: true },
          })) as typeof fetch;
    const adapter = new OpenAIAdapter(
      { name: 'strata', kind: 'openai', url: 'http://127.0.0.1:18500' },
      { fetchFn },
    );
    expect(await adapter.listModels()).toEqual([
      {
        name: 'qwen3.8-flash-next-iq3_s',
        parameterSize: undefined,
        capabilities: ['completion', 'tools', 'vision'],
        contextLength: undefined,
        runtimeContextLength: 131072,
      },
    ]);
  });

  it('keeps distinct models and the first entry of models that alias each other', async () => {
    const fetchFn = (async (url: string) =>
      url.endsWith('/v1/models')
        ? json({
            data: [
              { id: 'a', aliases: ['b'] },
              { id: 'b', aliases: ['a'] },
              { id: 'c' },
            ],
          })
        : json({}, 404)) as typeof fetch;
    const adapter = new OpenAIAdapter(
      { name: 's', kind: 'openai', url: 'http://x' },
      { fetchFn },
    );
    expect((await adapter.listModels()).map((m) => m.name)).toEqual(['a', 'c']);
  });

  it('works without /props (vLLM, LM Studio)', async () => {
    const fetchFn = (async (url: string) =>
      url.endsWith('/v1/models')
        ? json({ data: [{ id: 'llama', max_model_len: 32768 }, {}] })
        : json({ error: 'not found' }, 404)) as typeof fetch;
    const adapter = new OpenAIAdapter(
      { name: 'vllm', kind: 'openai', url: 'http://box:8000' },
      { fetchFn },
    );
    expect(await adapter.listModels()).toEqual([
      {
        name: 'llama',
        parameterSize: undefined,
        capabilities: [],
        contextLength: 32768,
        runtimeContextLength: 32768,
      },
    ]);
  });

  it('throws when the server answers with an error, so the router marks it down', async () => {
    const fetchFn = (async () => json({}, 401)) as typeof fetch;
    const adapter = new OpenAIAdapter(
      { name: 'strata', kind: 'openai', url: 'http://127.0.0.1:8080' },
      { fetchFn },
    );
    await expect(adapter.listModels()).rejects.toThrow(/401/);
  });
});

describe('[runner:adapters] registry', () => {
  it('has ollama and openai built in, and takes new kinds', async () => {
    expect(adapterKinds()).toEqual(
      expect.arrayContaining(['ollama', 'openai']),
    );
    registerAdapter('echo', (spec) => ({
      name: spec.name,
      kind: spec.kind,
      url: spec.url,
      listModels: async () => [{ name: 'echo-1', capabilities: [] }],
      forward: async () => new Response('ok'),
    }));
    const adapter = createAdapter({
      name: 'e',
      kind: 'echo',
      url: 'http://x',
    });
    expect(await adapter.listModels()).toEqual([
      { name: 'echo-1', capabilities: [] },
    ]);
    expect(parseBackendSpec('e=echo:http://x').kind).toBe('echo');
    expect(() =>
      createAdapter({ name: 'x', kind: 'nope', url: 'http://x' }),
    ).toThrow(/Unknown backend kind "nope"/);
  });
});

describe('[runner:adapters] router', () => {
  const fake = (name: string, models: string[], up = true): ModelAdapter => ({
    name,
    kind: 'fake',
    url: `http://${name}`,
    listModels: async () => {
      if (!up) {
        throw new Error('fetch failed');
      }
      return models.map((m) => ({ name: m, capabilities: [] }));
    },
    forward: async () => new Response('ok'),
  });

  it('keeps primary names, prefixes the others, and renames back when routing', async () => {
    const ollama = fake('ollama', ['qwen3.8:27b']);
    const strata = fake('strata', ['Qwen3.8-Flash-Next']);
    const router = new ModelRouter([ollama, strata], silentLogger);

    expect((await router.listModels()).map((m) => m.name)).toEqual([
      'qwen3.8:27b',
      'strata/Qwen3.8-Flash-Next',
    ]);

    const toStrata = router.route(
      '{"model":"strata/Qwen3.8-Flash-Next","stream":true}',
    );
    expect(toStrata.adapter).toBe(strata);
    expect(JSON.parse(toStrata.body)).toEqual({
      model: 'Qwen3.8-Flash-Next',
      stream: true,
    });

    const body = '{"model":"qwen3.8:27b"}';
    expect(router.route(body)).toEqual({
      adapter: ollama,
      body,
      model: 'qwen3.8:27b',
    });
  });

  it('routes by prefix before the first heartbeat, and unknown models to the primary', () => {
    const ollama = fake('ollama', []);
    const strata = fake('strata', []);
    const router = new ModelRouter([ollama, strata], silentLogger);
    expect(router.route('{"model":"strata/x"}').adapter).toBe(strata);
    expect(router.route('{"model":"whatever"}').adapter).toBe(ollama);
    expect(router.route('{}').adapter).toBe(ollama);
    expect(router.route('not json').adapter).toBe(ollama);
  });

  it('a backend that is down only removes its own models', async () => {
    const warn = jest.fn();
    const router = new ModelRouter(
      [fake('ollama', ['qwen3.8:27b']), fake('strata', ['q'], false)],
      { ...silentLogger, warn },
    );
    expect((await router.listModels()).map((m) => m.name)).toEqual([
      'qwen3.8:27b',
    ]);
    await router.listModels();
    // logged once, not every heartbeat
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/Cannot reach strata/);
    expect(router.anyReachable).toBe(true);
  });

  it('refuses duplicate backend names and an empty list', () => {
    expect(
      () => new ModelRouter([fake('a', []), fake('a', [])], silentLogger),
    ).toThrow(/used twice/);
    expect(() => new ModelRouter([], silentLogger)).toThrow(/at least one/);
  });
});
