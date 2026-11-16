# Local AI runners - gcli slice

**Feature slug:** `local-ai-runners` · canonical doc (architecture, protocol,
security, debugging table):
`graphql-server/docs/features/local-ai-runners.md`. This file covers only
what lives in gcli.

## Commands

| Command | What it does |
|---|---|
| `gcli runner:start [--name] [--token] [--ollama] [--backend name=kind:url]... [--backend-key name=key]... [--wsUrl] [--reset]` | Connects this machine's model servers (Ollama by default; see "Backends") to the chat. First run registers a runner with the `gcli login` session and saves it to `~/.graphql-server/runner.json` (0600); `--token` instead uses a token from Profile -> Local AI runners (headless machines); `--reset` forgets the saved runner and registers a new one. Runs until Ctrl+C, reconnecting with backoff (1s -> 30s). |
| `gcli runner:list` | Your runners: online, last seen, models |
| `gcli runner:models [--id] [--show a,b \| --all \| --none]` | Which models appear in the chat picker; no flag = list |
| `gcli runner:delete [--id]` | Delete a runner and revoke its token (default: the saved one) |
| `gcli runner:daemon:install` (alias `runner:start:daemon`) `[runner:start options] [--service] [--dry-run]` | Resolve/register the runner now (saves `runner.json`), then install + enable + restart a systemd USER unit (Linux). One Ollama: the unit runs `runner:start --ollama <resolved>`. With `--backend`: the resolved backends (keys included) are saved in `runner.json.backends` and the unit runs plain `runner:start` - keys never go in the unit. Re-installing without `--backend` drops saved backends |
| `gcli runner:daemon:start` / `:restart` `[--service]` | `systemctl --user start/restart`, then after ~2 s reads `ActiveState`/`ExecMainStatus` (`SystemdUserService.outcome`): running, or an error - exit 78 = token refused (deleted, or registered on another server than `~/.graphql-server/url`) with the `runner:daemon:install --reset` hint. Refuses when the unit is not installed |
| `gcli runner:daemon:stop` `[--service]` | `systemctl --user stop` (stays enabled: starts again at the next login) |
| `gcli runner:daemon:status` / `:logs` / `:uninstall` | `systemctl --user status`, `journalctl --user -f`, disable --now + remove the unit |

Endpoints: `--wsUrl` > `runner.json` > derived from the `gcli login` URL
(`https://api.lambforge.com` -> `wss://api.lambforge.com/subscriptions`;
`http://localhost:9004/...` -> `ws://localhost:9000/subscriptions`).
Ollama: `--ollama` > `$OLLAMA_HOST` (scheme optional, `0.0.0.0` -> `127.0.0.1`)
> `http://127.0.0.1:11434`. Requires Node >= 22 (global `WebSocket`).

## Backends (model adapters)

The wire format between Lambforge and the runner is always the OpenAI chat
API (`POST /v1/chat/completions`, the only allowed path - unchanged). A
**backend** is one local model server; its **adapter** owns only what differs
per server: discovering models (`listModels`) and forwarding a chat request
(`forward`, a pass-through for both built-ins). The backend (graphql-server)
is unaware of adapters: it still sees one runner and one model list, with the
same `LocalRunnerModelInput` fields.

- Built-in kinds: `ollama` (`/api/tags`, `/api/show`, `/api/ps`) and `openai`
  (`/v1/models`; `runtimeContextLength` from llama.cpp's `/props` `n_ctx`,
  else vLLM's `max_model_len`; `contextLength` from `meta.n_ctx_train` /
  `context_length` / `max_model_len`; capabilities from `/props`:
  `completion` + `tools` when `chat_template_caps.supports_tools` /
  `supports_tool_calls`, + `vision` when `modalities.vision` or an image
  input modality - no `/props` = `[]`, which the backend treats as
  tool-capable but the web app's runner page labels "chat only"; alias
  entries of one model are dropped, the first wins). Strata's engine is
  llama.cpp-based: the port and the required bearer key are per instance in
  `~/.strata/data/native-instances/<uuid>.json` (`port`, `api_key`) - e.g.
  18500, not the 8080 of its install file.
- Resolution (`adapters/spec.ts` `resolveBackends`): `--backend` (with
  `--ollama` prepended as `ollama`) > `runner.json.backends` (ignored when
  `--ollama` is given - that's what single-Ollama units run) > one Ollama.
  Keys: `--backend-key` > `$<NAME>_API_KEY` > saved key. Logs show `[key]`,
  never the key.
- Naming (`adapters/router.ts` `ModelRouter`): the first backend is primary
  and keeps its model names (a plain Ollama runner reports exactly what it
  always did, so saved `runner:models` selections keep working); the others
  are `<backend>/<model>`. `route()` maps a request's `model` back to the
  backend and its own name (body rewritten only then); unknown models go by
  prefix, else to the primary, unchanged. Each backend's reachability is
  tracked and logged separately; a down backend only drops its own models.
- New kind: implement `ModelAdapter` (or extend `HttpModelAdapter`) in
  `adapters/` and `registerAdapter('<kind>', factory)` in
  `adapters/registry.ts`. An adapter for a server with a different chat API
  overrides `forward` and translates request and stream to/from the OpenAI
  format.

## Code

`src/commands/runner/`:

- `connection.ts` - `RunnerConnection`: subscriptions-transport-ws client
  (`connection_init` with `{ runnerToken }`, subscription
  `subscribeToRunnerRequests`, mutations `runnerHeartbeat` / `runnerRespond`
  over the same socket), heartbeat every 30s (a failed heartbeat forces a
  reconnect), request proxying to Ollama, `cancel` -> abort, `ping` every
  30s while Ollama keeps a request queued. `FrameSender` numbers frames
  (`seq`), merges consecutive chunks (<= 32KB) and sends batches every 50ms,
  sequentially. `RunnerAuthError` = token refused -> exit 1 with a `--reset` hint.
- `adapters/` - `types.ts` (`ModelAdapter`, `AdapterSpec`), `base.ts`
  (`HttpModelAdapter`: URL, bearer key, pass-through `forward`),
  `ollama.ts` (`OllamaAdapter` over `OllamaModels`), `openai.ts`
  (`OpenAIAdapter`), `registry.ts`, `router.ts` (`ModelRouter`), `spec.ts`
  (`--backend` parsing, `resolveBackends`). `RunnerConnection` takes
  `backends` (or ready `adapters`; the old `ollamaUrl` still works) and
  delegates heartbeat models and request routing to the router.
- `ollama.ts` - `ALLOWED_REQUESTS` (only `POST /v1/chat/completions`; the
  backend has its own copy), `OllamaModels` (`/api/tags` + cached
  `/api/show` per digest; drops models without the `completion` capability
  and models `/api/show` answers 404/410 for - e.g. retired `:cloud`
  models, cached so they aren't re-asked every heartbeat). Each heartbeat
  also reads `/api/ps` and reports `runtimeContextLength` - the window a
  LOADED model actually runs with (OLLAMA_CONTEXT_LENGTH / Ollama default).
  The backend fits every request to it, because Ollama silently drops the
  oldest messages of a prompt that is too long (see the canonical doc,
  "Context window").
- `daemon.ts` - `buildUnit` (pure; systemd quoting; `Restart=always`,
  `RestartPreventExitStatus=78`), `resolveGcliCommand` (node + script, or
  the SEA binary; warns for the npx cache), `SystemdUserService`
  (`systemctl --user` via execFile, never a shell; home dir injectable so
  tests can't touch the real `~/.config`). `daemon-commands.ts` - the
  `runner:daemon:*` actions. Adapted from cli-builder's `SystemctlService`,
  but a USER unit (no root) and no secrets in the unit. `runner:start` exits
  78 (EX_CONFIG) when the token is refused, so systemd stops instead of
  restart-looping.
- `config.ts` (saved runner, URL derivation), `start.ts`, `list.ts`,
  `models.ts`, `delete.ts`, `index.ts` (command registration), `types.ts`.
- `src/services/gql-client.ts` - `createLocalRunner`, `listLocalRunners`,
  `setLocalRunnerModels`, `deleteLocalRunner` (through the gateway, with the
  login session).

## How to test

```bash
npx jest test/runner.spec.ts --coverage=false   # fake server socket + fake streaming Ollama (+ a Strata-like 2nd backend)
npx jest test/runner-adapters.spec.ts --coverage=false   # --backend parsing, keys, OpenAI adapter, registry, router
npm run build && node release/index.js runner:start --help
```

`test/runner.spec.ts` plays both the Lambforge server (protocol replies) and
Ollama (streamed body, multi-byte UTF-8 split across reads, held-open
streams). Full end-to-end steps: the canonical doc's "How to test".

`npm run build` rewrites the committed `release/index.js` - don't commit
that from a feature branch unless you are releasing.

## How to debug

Runner log lines: `-> chat request (<model>)`, `<- <status> (<model>) in Ns`,
`x  cancelled`, `x  <error>`, `Heartbeat failed: ...`, `Cannot reach <backend>
(<kind>) at <url> (...)` (once per outage, per backend), `<backend> at <url>: N
model(s)`. With several backends, `-> chat request (<model>) via <backend>`.
`Backends: ...` at startup shows what was resolved (`[key]` = a key is set). `Disconnected from Lambforge; reconnecting in Ns` = socket closed
(backend restart, network). For the backend side and the symptom table see
the canonical doc.
