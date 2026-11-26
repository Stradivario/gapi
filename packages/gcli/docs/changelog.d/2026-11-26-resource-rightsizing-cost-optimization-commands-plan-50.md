## 2026-11-26 - resource-rightsizing: cost optimization commands (plan 50)

**Feature:** resource-rightsizing · **Type:** feat

- New: `lambda:resources` (+ `--auto` / `--fixed`), `plugin:resources` (+ `--apply`), `plugin:auto-grow`, `project:hibernation`, `project:sleep`, `project:wake`, `project:savings`, `cluster:pod-placement`; `cluster:autoscale --replace-cheaper / --no-replace-cheaper`. `src/services/cost-optimization.ts`, `src/commands/cost/`. README section, README-CLI regenerated.
- **Test:** `npx jest --coverage=false test/cost-commands.spec.ts`.
- **Debug:** `--json` prints the raw rows.
- **Verification:** 280 tests; savings, plugin:resources, lambda:resources, project:hibernation run against production.
