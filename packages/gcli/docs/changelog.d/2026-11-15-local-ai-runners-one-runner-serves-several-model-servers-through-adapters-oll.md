## 2026-11-15 - local-ai-runners: one runner serves several model servers through adapters (Ollama + OpenAI-compatible, e.g. Strata)

**Feature:** local-ai-runners · **Type:** feat

Why: a runner could only reach one Ollama. Models served by Strata (a llama.cpp-based engine) or any other OpenAI-compatible server (llama-server, LM Studio, vLLM) could not reach the Lambforge chat. Pointing `--ollama` at them did not work either: they have no `/api/tags`, `/api/show` or `/api/ps`.

- New `src/commands/runner/adapters/`:
  - `ModelAdapter` (`types.ts`): an adapter owns `listModels()` and `forward()`. The format between Lambforge and the runner stays the OpenAI chat API (`POST /v1/chat/completions`). The allow-list is unchanged, so this is a gcli-only change.
  - `HttpModelAdapter` (`base.ts`) handles the URL and the optional bearer key. Its default `forward` passes the request straight through.
  - Built-in adapters:
    - `OllamaAdapter` (`ollama.ts`) wraps the existing `OllamaModels`.
    - `OpenAIAdapter` (`openai.ts`) reads `/v1/models`. The running context window comes from `meta.n_ctx`, llama.cpp's `/props` `n_ctx`, or vLLM's `max_model_len`.
    - Capabilities use Ollama's names. When `/props` answers: `completion`, plus `tools` (`chat_template_caps.supports_tools` / `supports_tool_calls`), plus `vision`. Without `/props`: `[]`. An empty list would work in the backend, but the web app's runner page shows "chat only - no agent tools" for it; that label is what showed up first with Strata.
    - llama.cpp lists a model again under each alias (Strata: `qwen3.8-flash-next-iq3_s` and `iq3_s`). The adapter keeps the first entry only.
  - `registry.ts`: `registerAdapter(kind, factory)`. A new kind of server needs one class and one registration line.
  - `ModelRouter` (`router.ts`):
    - Merges every backend's models into one heartbeat. The first backend is the primary and keeps its model names; the others are shown as `<backend>/<model>`.
    - Routes each request by its `model` and renames the model back before forwarding. The request body is rewritten only when the name differs.
    - Tracks reachability per backend: a backend that is down only removes its own models.
  - `spec.ts` handles `--backend <name>=<kind>:<url>` parsing and `resolveBackends`. Resolution order: `--backend` (`--ollama` is prepended), then `runner.json.backends`, then one Ollama. API keys come from `--backend-key`, then `$<NAME>_API_KEY`, then the saved key.
- `runner:start` and `runner:daemon:install` gain the repeatable `--backend` and `--backend-key` flags (`index.ts`):
  - `start.ts` logs `Backends: ...`; a set key shows as `[key]`.
  - `daemon-commands.ts` saves the resolved backends, keys included, in the 0600 `runner.json`, and the unit then runs plain `runner:start`. Keys never go into the unit. Re-installing without `--backend` drops the saved backends.
- `RunnerConnection` (`connection.ts`) takes `backends` or ready-made `adapters`; the old `ollamaUrl` still works. Errors name the backend, e.g. "Could not reach strata (openai) at ...".
- Backward compatible: without `--backend`, the heartbeat, the requests and the request bodies are byte-for-byte what they were. Existing units (`runner:start --ollama <url>`) behave the same.
- No graphql-server change is needed: the model objects keep the `LocalRunnerModelInput` fields, and `/` in model names was already valid (e.g. `x/z-image-turbo:fp8`).
- Docs updated: README ("Several model servers in one runner"), `docs/features/local-ai-runners.md` ("Backends (model adapters)"), and the `local-ai-runners` skill (invariants).
- **Test:**
  - `npx jest --coverage=false test/runner-adapters.spec.ts test/runner.spec.ts`. The adapter spec covers `--backend` parsing and errors, key precedence, the OpenAI adapter with and without `/props`, the registry with a custom kind, and the router (naming, renaming, prefix fallback, a down backend, duplicate names). `runner.spec.ts` adds end to end through the socket: one heartbeat carrying both backends' models; a `strata/` model sent to the second backend under its own name with the bearer key; Ollama kept serving while the second backend is down.
  - Live: `gcli runner:start --ollama http://127.0.0.1:11434 --backend strata=openai:http://127.0.0.1:8080`, then pick `strata/<model>` in the chat.
- **Debug:**
  - Startup line `Backends: ...` shows what was resolved.
  - `Cannot reach <backend> (<kind>) at <url> (...)` is logged once per outage per backend; `<backend> at <url>: N model(s)` when it comes back.
  - `-> chat request (<model>) via <backend>` shows the routing.
  - A model missing from the picker: check that its server answers `/v1/models`. A 401 there means the key is missing or wrong (`--backend-key` / `$<NAME>_API_KEY`).
  - A `strata/...` model that reaches the wrong server: the backend name must match the prefix.
- **Verification:**
  - jest: 20 suites, 169 tests pass. `tsc --noEmit` and eslint are clean.
  - `npm run build`: `runner:start --help` lists the flags. `runner:daemon:install --dry-run --backend strata=openai:http://127.0.0.1:8080` gives `ExecStart=... runner:start` (no key); without `--backend` it is unchanged (`--ollama http://127.0.0.1:11434`).
  - Live, against the real Ollama with the router and both adapters: 3 models listed with capabilities and context, and a chat request through `forward` returned 200. Strata on :8080 was not running (its model was still downloading); it was reported as unreachable while Ollama kept working.
  - Live with Strata (port 18500, with key) through the `lambforge-runner` service: `gcli runner:list` shows `qwen3.8:27b, gpt-oss-128k:latest, gpt-oss:20b, strata/qwen3.8-flash-next-iq3_s`. The Strata model reports `completion, tools, vision` and runtime context 131072.
  - Not run: a chat request to the Strata model through the Lambforge chat.
  - jest after the capabilities and alias fix: 20 suites, 171 tests pass.
