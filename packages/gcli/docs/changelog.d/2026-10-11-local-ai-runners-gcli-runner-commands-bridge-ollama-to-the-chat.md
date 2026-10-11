## 2026-10-11 - local-ai-runners: gcli runner commands bridge a local Ollama to the chat

**Feature:** local-ai-runners · **Type:** feat

- `gcli runner:start` registers the machine with the `gcli login` session
  (or uses `--token`), saves `~/.graphql-server/runner.json` (0600) and keeps
  an outbound subscriptions-transport-ws connection (`RunnerConnection`):
  `subscribeToRunnerRequests`, `runnerHeartbeat` every 30s (models from
  Ollama `/api/tags` + `/api/show`, non-chat models dropped),
  `runnerRespond` with `FrameSender` (seq, 50ms batches, chunks merged to
  32KB), `ping` while Ollama queues, cancel -> abort, reconnect 1s -> 30s,
  refused token -> exit 1 with a `--reset` hint.
- `runner:list`, `runner:delete`; `GraphqlClienAPI` runner calls.
- Only `POST /v1/chat/completions` is proxied (`ALLOWED_REQUESTS`).
- Endpoint derived from the login URL (dev :9004 -> ws :9000).
- Backend half: graphql-server `local-runner` module; UI in gql-fission.
- **Test:** `npx jest test/runner.spec.ts --coverage=false` (fake server
  socket + fake streaming Ollama: auth, heartbeat models, ordered streaming
  with split UTF-8, allow-list, cancel, ping, refused token, URL rules).
- **Debug:** runner log `->` / `<-` / `x` lines, `Heartbeat failed`,
  `Cannot reach Ollama`, `Disconnected ... reconnecting`; backend side in
  `graphql-server/docs/features/local-ai-runners.md#how-to-debug`.
- **Verification:** gcli suite green; `tsc` + eslint clean; live: runner
  registered against the dev gateway, connected, 31 chat models reported,
  reconnect reused the saved runner, chat answered by `qwen3.8:27b`.
