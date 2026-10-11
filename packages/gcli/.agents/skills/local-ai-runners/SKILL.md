---
name: local-ai-runners
description: Work on the gcli local AI runner (runner:start/list/models/delete) - the subscriptions-transport-ws client that bridges a user's Ollama to the Lambforge chat. USE when the runner won't connect, drops requests, or before changing src/commands/runner/**.
---

# gcli local AI runner

Slice doc: `docs/features/local-ai-runners.md`. Canonical (protocol,
security, symptom table): `graphql-server/docs/features/local-ai-runners.md`.

## Invariants

- Outbound only: one WebSocket to `/subscriptions`
  (`connectionParams.runnerToken`); subscription + mutations share it.
  Never connect to RabbitMQ or open a port.
- `ALLOWED_REQUESTS` (`ollama.ts`) mirrors the backend's
  `RUNNER_ALLOWED_PATHS` - only `POST /v1/chat/completions`. Change both or
  neither.
- Every response frame of a request gets the next `seq`; batches are sent
  sequentially (`FrameSender`). The backend re-orders, but don't rely on it.
- A request queued in Ollama sends `ping` every 30s, or the backend's 10-min
  idle timeout kills it (spawned agent workers queue on one GPU).
- Socket close aborts every in-flight Ollama request; a refused token is
  fatal (`RunnerAuthError`), everything else reconnects with backoff.
- Global `WebSocket` -> Node >= 22.
- Daemon (`runner:daemon:*`, `daemon.ts`): systemd USER unit; never put the
  token or other secrets in the unit (it's world-readable-ish config) - it
  runs `runner:start`, which reads the 0600 `runner.json`. Keep exit code 78
  for "token refused" in sync with `RestartPreventExitStatus`. Tests must
  pass an explicit home dir to `SystemdUserService` (os.homedir() ignored a
  changed HOME under jest and wrote into the real `~/.config` once).

## Run it against a dev stack

```bash
gcli login --url http://localhost:9004/graphql ...      # dev gateway
npm run build && node release/index.js runner:start      # ws://localhost:9000/subscriptions derived
node release/index.js runner:models --show qwen3.8:27b   # keep the picker short
```

## Tests

`npx jest test/runner.spec.ts --coverage=false` - `FakeServer` plays the
Lambforge socket (acks, operation replies, pushes requests), `fakeOllama`
plays Ollama (tags/show/streamed body, optional hold). Add a case there for
any protocol change.
