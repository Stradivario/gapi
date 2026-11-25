## 2026-11-25 - repo-plan: plan/apply: one lambda per !switch / !if variant; apply builds before it deploys

**Feature:** repo-plan · **Type:** feat

- One `lambforge.yaml` with `!switch` / `!if` on a variable is planned once
  per value (`switchVariables`, `unitsOfFile`, `unitKey`): cluster-worker
  (CLUSTER_MODE=worker) and graphql-server-subscriptions
  (SUBSCRIPTIONS_ONLY=true) were shown as unmanaged. `loadYaml(content, env)`
  evaluates with given variables.
- `gcli apply` builds before each deploy: `build:` of lambforge.yaml (new
  top-level key, both schema copies), else `npm run build`; in the unit
  folder with the variant's variables set; `--no-build` skips it. It
  deployed whatever `dist/` held before.
- Variants that share an environment apply it once; `validate` findings
  are per variant.
- **Test:** `npx jest --coverage=false test/repo-variants` (8 tests).
- **Debug:** a lambda still "unmanaged" although a file builds it = its
  name comes from something other than a `!switch` / `!if` variable (e.g.
  `!env`); a variant missing = the cases give the same `function.name`.
- **Verification:** jest 266 tests, tsc + eslint clean; read-only `gcli
  plan` against production: graphql-server-functions 28 lambdas in sync
  incl. cluster-worker (7 unmanaged, was 8); graphql-server both
  graphql-server and graphql-server-subscriptions in sync. A real apply with
  the build step was not run.
