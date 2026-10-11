## 2026-10-11 - local-ai-runners: gcli runner:models chooses the models shown in chat

**Feature:** local-ai-runners · **Type:** feat

- `gcli runner:models [--id] [--show a,b | --all | --none]` -> 
  `setLocalRunnerModels`; no flag lists models with a `shown` column. Warns
  about names the runner doesn't report (kept anyway).
- **Test:** `npx jest test/runner.spec.ts --coverage=false`
  (`parseSelection` flag mapping and conflicts).
- **Debug:** "Runner ... not found" = wrong `--id` or not your runner; an
  error naming `setLocalRunnerModels` = backend older than this feature.
- **Verification:** gcli suite 27/27; `tsc` + eslint clean.
