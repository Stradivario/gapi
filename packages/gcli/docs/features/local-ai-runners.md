# Local AI runners - gcli slice

**Feature slug:** `local-ai-runners` · canonical doc (architecture, protocol,
security, debugging table):
`graphql-server/docs/features/local-ai-runners.md`. This file covers only
what lives in gcli.

## Commands

| Command | What it does |
|---|---|
| `gcli runner:start [--name] [--token] [--ollama] [--wsUrl] [--reset]` | Connects this machine's Ollama to the chat. First run registers a runner with the `gcli login` session and saves it to `~/.graphql-server/runner.json` (0600); `--token` instead uses a token from Profile -> Local AI runners (headless machines); `--reset` forgets the saved runner and registers a new one. Runs until Ctrl+C, reconnecting with backoff (1s -> 30s). |
| `gcli runner:list` | Your runners: online, last seen, models |
| `gcli runner:models [--id] [--show a,b \| --all \| --none]` | Which models appear in the chat picker; no flag = list |
| `gcli runner:delete [--id]` | Delete a runner and revoke its token (default: the saved one) |

Endpoints: `--wsUrl` > `runner.json` > derived from the `gcli login` URL
(`https://api.lambforge.com` -> `wss://api.lambforge.com/subscriptions`;
`http://localhost:9004/...` -> `ws://localhost:9000/subscriptions`).
Ollama: `--ollama` > `$OLLAMA_HOST` (scheme optional, `0.0.0.0` -> `127.0.0.1`)
> `http://127.0.0.1:11434`. Requires Node >= 22 (global `WebSocket`).

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
- `config.ts` (saved runner, URL derivation), `start.ts`, `list.ts`,
  `models.ts`, `delete.ts`, `index.ts` (command registration), `types.ts`.
- `src/services/gql-client.ts` - `createLocalRunner`, `listLocalRunners`,
  `setLocalRunnerModels`, `deleteLocalRunner` (through the gateway, with the
  login session).

## How to test

```bash
npx jest test/runner.spec.ts --coverage=false   # fake server socket + fake streaming Ollama
npm run build && node release/index.js runner:start --help
```

`test/runner.spec.ts` plays both the Lambforge server (protocol replies) and
Ollama (streamed body, multi-byte UTF-8 split across reads, held-open
streams). Full end-to-end steps: the canonical doc's "How to test".

`npm run build` rewrites the committed `release/index.js` - don't commit
that from a feature branch unless you are releasing.

## How to debug

Runner log lines: `-> chat request (<model>)`, `<- <status> (<model>) in Ns`,
`x  cancelled`, `x  <error>`, `Heartbeat failed: ...`, `Cannot reach Ollama
at ...`. `Disconnected from Lambforge; reconnecting in Ns` = socket closed
(backend restart, network). For the backend side and the symptom table see
the canonical doc.
