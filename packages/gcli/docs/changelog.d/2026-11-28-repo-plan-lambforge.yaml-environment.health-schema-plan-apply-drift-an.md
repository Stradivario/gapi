## 2026-11-28 - repo-plan: lambforge.yaml environment.health: schema, plan/apply drift and export

**Feature:** repo-plan · **Type:** feat

- `environment.health: { readiness?, liveness? }`, each `{ http | tcp,
  failAfter? }`, is in the lambforge.yaml schema
  (`src/schema/lambforge.schema.json`, `definitions.probe`) and read back
  with every environment (`environment.fragment.ts`). `repo/drift.ts`
  compares it by value (`normalized()`), and `repo/export.ts` writes it.
- Needs the server with `health` on the environment type
  (graphql-server-lambdas 3fa5dba, deployed 2026-11-28). An older server
  answers "Cannot query field health".
- README: the yaml example plus a "Health checks" paragraph.
- **Test:** `npx jest --coverage=false test/repo-plan.spec.ts`.
- **Debug:** `gcli plan` shows `health` as drift when the stored value
  differs. `null` and `__typename` are ignored.
- **Verification:** 13 repo-plan tests pass. `tsc` is clean. A locally
  built `gcli plan` against production: 2 in sync, 0 errors.
