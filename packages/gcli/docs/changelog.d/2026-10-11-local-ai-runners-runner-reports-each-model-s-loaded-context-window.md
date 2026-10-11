## 2026-10-11 - local-ai-runners: runner reports each model's loaded context window

**Feature:** local-ai-runners · **Type:** fix

- Heartbeat models now carry `runtimeContextLength` from Ollama `/api/ps`
  (the window a loaded model really runs with, e.g. 32,768 for qwen3.8:27b
  whose max is 262,144). The backend fits every request to it - fixes
  `500 no user query found in messages` in long chats, caused by Ollama
  silently truncating oversized prompts (backend half: graphql-server
  `fix(local-ai-runners): fit requests to the model's real context window`).
- Models `/api/show` answers 404/410 for (a retired `glm-5.1:cloud` was
  still listed by `/api/tags`) are no longer offered, and the answer is
  cached instead of re-asked every heartbeat.
- **Test:** `npx jest test/runner.spec.ts --coverage=false` (fake Ollama
  answers `/api/ps` with a loaded model at 65536 and 410 for a retired
  cloud model; the heartbeat must carry the window and omit that model).
- **Debug:** `ollama ps` shows the live window the runner reports;
  `db["local-runners"]` -> `models[].runtimeContextLength` on the backend.
  An unloaded model reports nothing - the backend keeps its last value.
- **Verification:** gcli 27/27, tsc + eslint clean; live: runner reported
  30 models (retired cloud model gone) and the dev backend stored
  qwen3.8:27b runtimeContextLength 32768.
