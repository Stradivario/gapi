# gcli: local AI runner commands (+ AI-ready package setup)

## Summary

New `gcli runner:*` commands connect a user's local Ollama to the
Lambforge chat, so their own models can be used like hosted ones -
including agent mode and MCP tools. The connection is **outbound only** (a
WebSocket to `/subscriptions`): it works behind NAT and Ollama is never
exposed. Only chat completions (`POST /v1/chat/completions`) are ever
proxied.

Also adds the AI-ready setup for the gcli package (`AGENTS.md`, skills,
feature-keyed changelog).

## Changes

### Commands (`packages/gcli/src/commands/runner/`)

| Command | What it does |
|---|---|
| `gcli runner:start` | Registers the machine with the `gcli login` session (or `--token` for headless machines), saves `~/.graphql-server/runner.json` (0600), connects and serves requests until Ctrl+C. Options: `--name`, `--token`, `--ollama`, `--wsUrl`, `--reset` |
| `gcli runner:list` | Runners: online, last seen, models |
| `gcli runner:models` | Which models appear in the chat picker: `--show a,b`, `--all`, `--none`; no flag = list |
| `gcli runner:delete` | Delete a runner and revoke its token |

- `RunnerConnection`: subscriptions-transport-ws client - heartbeat every
  30s with the Ollama models (`/api/tags` + `/api/show`; non-chat models
  dropped), requests proxied to Ollama and streamed back in ordered,
  batched frames (50ms, chunks merged up to 32KB), `ping` while Ollama
  queues a request, cancel on Stop, reconnect with backoff (1s -> 30s), a
  refused token exits with a `--reset` hint.
- Endpoint derived from the `gcli login` URL (production
  `wss://api.lambforge.com/subscriptions`; dev :9004 -> ws :9000).
  `OLLAMA_HOST` supported. Requires Node >= 22.
- `README.md`: new "Local AI Models (Ollama runner)" section.
  `README-CLI.md` regenerated from `--all-help` - it was also missing the
  cron, cluster, rabbitmq, plugin and `lambda:package` commands.

### CI: PR test run (repo root)
- New `.github/workflows/tests.yml` (**Tests**): on every push to a
  non-master branch - `npx @rxdi/bolt install`, `npm run lint`, `npm test`
  across all workspaces, like graphql-server's Tests and
  graphql-server-lambdas' Specs. Until now lint/test ran only in Publish,
  i.e. after the merge to master.

### Package setup
- `AGENTS.md` + `CLAUDE.md` loader; skills in `packages/gcli/.agents/skills`
  (`cluster-targeting` moved there, new `gcli-command`,
  `local-ai-runners`, `changelog`).
- Changelog fragments in `docs/changelog.d/`, `npm run changelog -- ...`.
- `jest.config.js` maps the tsconfig path aliases (`~/`, `@introspection/`,
  `@commands/`) - specs importing command code could not resolve before.

## How to test

```bash
cd packages/gcli
npx jest --coverage=false          # 27/27 (test/runner.spec.ts: fake server socket + fake streaming Ollama)
npx tsc --noEmit -p .
npm run build && node release/index.js runner:start --help
```

End to end against a backend with graphql-server `feat/local-ai-runners`:
`gcli login`, `ollama serve`, `node release/index.js runner:start` ->
`Connected as "<name>"`; pick the model in the chat; `runner:models --show
<model>`; Ctrl+C -> runner shows offline within ~90s.

## Release notes

- `release/index.js` is not rebuilt in this branch - `npm run patch`
  builds and publishes it.
- Release after graphql-server `feat/local-ai-runners` is deployed (the
  commands call the new resolvers).

## Related PRs

- graphql-server `feat/local-ai-runners` - backend (required first)
- gql-fission `feat/local-ai-runners` - profile page and picker

Docs: `packages/gcli/docs/features/local-ai-runners.md` ->
`graphql-server/docs/features/local-ai-runners.md` (canonical).
