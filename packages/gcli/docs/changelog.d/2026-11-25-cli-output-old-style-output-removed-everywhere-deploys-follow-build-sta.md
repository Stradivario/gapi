## 2026-11-25 - cli-output: Old-style output removed everywhere; deploys follow build status + deployStatus

**Feature:** cli-output · **Type:** feat

- Every create / update / delete command ends with a `✔` line before its
  table (environments, lambdas, time + queue triggers, plugins, brokers);
  success messages of cluster attach / detach / node-storage / apply,
  runner, workspace and workflow commands are `✔` instead of `i`.
- `gcli build`: one step (`✔ build: bundled src/main.ts -> dist/index.js
  (14.5 MB) 2.8s`), esbuild warnings / errors as `⚠` / `✖` lines with
  file:line - no more emoji lines.
- `gcli start`: `i start: running ...` / `i start: <file> changed -
  restarting` instead of `-----` banners; `workspace:start --yolo` warning
  without hand-written escape codes; `environment:update` no longer dumps
  its whole input object.
- Deploys: every lambda:create / update is followed (the mutation's answer
  has no deployStatus): `deployStateOf` (pure, `helpers/deploy-state.ts`)
  combines `getLambdaBuildStatus` with the lambda's `deployStatus` where
  the API has it (graphql-server-lambdas exposes it since 2026-11-25), so
  "built and live" means rolled out.
- **Test:** `npx jest --coverage=false` (new `test/deploy-state.spec.ts`).
- **Debug:** a deploy saying "built and live" before the rollout = the API
  has no `deployStatus` (older graphql-server-lambdas) - built is taken as
  live there.
- **Verification:** jest 32 suites / 258 tests, tsc + eslint clean; real
  `lambda:update` of graphql-server-lambdas (saved, then "built and live
  10s"), `gcli build`, `project:list`, `cron:list`, `environment:list`
  against production.
