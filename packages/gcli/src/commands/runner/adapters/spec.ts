import { resolveOllamaUrl } from '../ollama';
import { adapterKinds, hasAdapterKind } from './registry';
import { AdapterSpec } from './types';

const NAME = /^[a-z0-9][a-z0-9_-]*$/i;

const normaliseUrl = (raw: string) => {
  const withScheme = /^https?:\/\//.test(raw) ? raw : `http://${raw}`;
  const url = new URL(withScheme);
  if (url.hostname === '0.0.0.0') {
    url.hostname = '127.0.0.1';
  }
  // Keep a path prefix (some servers live under e.g. /api), drop a trailing slash.
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
};

/**
 * Parses one `--backend` value: `<name>=<kind>:<url>`, or `<name>=<url>` when
 * the name is itself a kind (`ollama=http://127.0.0.1:11434`).
 *   strata=openai:http://127.0.0.1:8080
 *   ollama=http://gpu-box:11434
 */
export const parseBackendSpec = (value: string): AdapterSpec => {
  const eq = value.indexOf('=');
  if (eq < 1) {
    throw new Error(
      `--backend "${value}": expected <name>=<kind>:<url>, e.g. strata=openai:http://127.0.0.1:8080`,
    );
  }
  const name = value.slice(0, eq).trim();
  let rest = value.slice(eq + 1).trim();
  if (!NAME.test(name)) {
    throw new Error(
      `--backend "${value}": the name may only use letters, digits, - and _`,
    );
  }
  // "openai:http://..." / "openai:127.0.0.1:8080" -> kind "openai";
  // "http://..." / "gpu-box:11434" -> no kind (the name is the kind).
  const kindMatch = /^([a-z][a-z0-9_-]*):(?!\/\/)/i.exec(rest);
  let kind = name;
  if (kindMatch && hasAdapterKind(kindMatch[1])) {
    kind = kindMatch[1];
    rest = rest.slice(kindMatch[0].length);
  }
  if (!hasAdapterKind(kind)) {
    throw new Error(
      `--backend "${value}": unknown kind "${kind}" (known: ${adapterKinds().join(', ')})`,
    );
  }
  if (!rest) {
    throw new Error(`--backend "${value}": missing URL`);
  }
  return { name, kind: kind.toLowerCase(), url: normaliseUrl(rest) };
};

/** `strata=sk-...` -> ['strata', 'sk-...']. */
const parseKey = (value: string): [string, string] => {
  const eq = value.indexOf('=');
  if (eq < 1 || eq === value.length - 1) {
    throw new Error('--backend-key: expected <name>=<key>');
  }
  return [value.slice(0, eq).trim(), value.slice(eq + 1)];
};

/** STRATA_API_KEY for a backend named "strata". */
export const apiKeyEnvVar = (name: string) =>
  `${name.toUpperCase().replace(/-/g, '_')}_API_KEY`;

export interface BackendOptions {
  ollama?: string;
  backend?: string[];
  backendKey?: string[];
}

/**
 * The backends to serve from, in order of preference:
 *  1. `--backend` (repeatable); `--ollama <url>` adds an "ollama" backend first
 *  2. the backends saved in runner.json (`runner:daemon:install --backend ...`)
 *  3. one Ollama: `--ollama` > $OLLAMA_HOST > http://127.0.0.1:11434 (as before)
 * API keys: `--backend-key <name>=<key>` > $<NAME>_API_KEY > the saved key.
 */
export const resolveBackends = (
  cmd: BackendOptions,
  saved?: AdapterSpec[],
  env: NodeJS.ProcessEnv = process.env,
): AdapterSpec[] => {
  const ollamaUrl = () =>
    resolveOllamaUrl(cmd.ollama || env.OLLAMA_HOST || 'http://127.0.0.1:11434');
  let specs: AdapterSpec[];
  if (cmd.backend?.length) {
    specs = cmd.backend.map(parseBackendSpec);
    if (cmd.ollama && !specs.some((s) => s.name === 'ollama')) {
      specs.unshift({
        name: 'ollama',
        kind: 'ollama',
        url: ollamaUrl(),
      });
    }
  } else if (saved?.length && !cmd.ollama) {
    specs = saved.map((s) => ({ ...s }));
  } else {
    specs = [{ name: 'ollama', kind: 'ollama', url: ollamaUrl() }];
  }

  const keys = new Map((cmd.backendKey ?? []).map(parseKey));
  for (const name of keys.keys()) {
    if (!specs.some((s) => s.name === name)) {
      throw new Error(`--backend-key ${name}=...: no backend named "${name}"`);
    }
  }
  return specs.map((spec) => {
    const apiKey =
      keys.get(spec.name) ?? env[apiKeyEnvVar(spec.name)] ?? spec.apiKey;
    return apiKey ? { ...spec, apiKey } : spec;
  });
};

/** For logs: never print a key. */
export const describeBackends = (specs: AdapterSpec[]) =>
  specs
    .map(
      (s) =>
        `${s.name}${s.kind === s.name ? '' : ` (${s.kind})`} ${s.url}${s.apiKey ? ' [key]' : ''}`,
    )
    .join(', ');
