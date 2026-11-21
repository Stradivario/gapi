## 2026-11-22 - repo-plan: gcli validate, plan and export over every lambforge.yaml of a repository

**Feature:** repo-plan · **Type:** feat

- `gcli validate [path] [--online]`: finds every `lambforge.yaml` (skips
  node_modules, .git, .gcache, dist, release, .gitignore matches), checks
  each against the new JSON Schema (`src/schema/lambforge.schema.json`,
  also published at lambforge.com/schemas/lambforge.json) plus cross-file
  clashes; `--online` compares function / environment keys with the live
  input types.
- `gcli plan [path] [--exit-code] [--json]`: in sync / will change /
  missing per unit and section (function, environment, triggers.time,
  triggers.mq, domains) and the project's unmanaged lambdas. Read-only.
- `gcli export <lambda> [-o]`: lambforge.yaml from a running lambda.
- A unit without `environment:` inherits the nearest parent's.
- tsconfig: `resolveJsonModule`.
- **Test:** `npx jest test/repo-plan`.
- **Debug:** `docs/features/repo-plan.md`.
- **Verification:** 10 new specs, full suite 236 green; live: validate on
  graphql-server-functions (24 files, 1 warning: `function.config` typo in
  generate-monthly-invoice), legends, reactivex-backend clean; plan against
  production found real drift (yaml pins builder 1.0.9 / older images than
  what runs); export of generate-monthly-invoice validated clean.
