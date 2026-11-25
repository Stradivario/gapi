## 2026-11-22 - local-ai-runners: README: set up Strata and Inkling 2 Mini (llama-server) as runner backends

**Feature:** local-ai-runners · **Type:** docs

- README "Example: Strata and Inkling 2 Mini next to Ollama" (under
  "Several model servers in one runner"): how to find Strata's per-instance
  port and key, and how to run Inkling 2 Mini on llama.cpp `llama-server`
  (b12633+ for PR #32704; Unsloth `Mainline_Support` or ggml-org GGUFs, as the
  root Unsloth files fail with `blk.24.attn_q.weight not found`; no
  `--n-gpu-layers 999`, which disables `--fit`). Also covers all three as
  one `runner:daemon:install` and what happens when a backend is stopped.
- docs/features/local-ai-runners.md: Strata is not llama.cpp-based; it serves
  a llama.cpp-style API from its own engine and runs only its own model
  families. Points to the README example.
- No code change.
- **Test:** follow the README section on a machine with Ollama + a
  llama-server; `gcli runner:daemon:logs` lists every backend with its
  model count, and the models appear as `<backend>/<model>` in the chat.
- **Debug:** runner log `Cannot reach <name> (openai) at <url>` = that server
  is down or on another port; llama-server log
  `check_tensor_dims: tensor 'blk.24.attn_q.weight' not found` = wrong
  (Unsloth-layout) GGUF; `cudaMalloc failed: out of memory` on device 0 = a
  hand-set `--n-gpu-layers`.
- **Verification:** run live on a 2× RTX 3080 Ti box: llama-server b12633
  with Inkling-2-Mini-UD-Q8_K_XL (mainline) on :18600, added as backend
  `inkling` next to ollama + strata. Runner logged
  `inkling (openai) at http://127.0.0.1:18600: 1 model(s)` and served
  `inkling/inkling-2-mini` chat requests (200). /props reported vision +
  tool calls. With the server stopped, the runner logged a retry and kept
  serving Ollama. Docs only, so no tests were run.
