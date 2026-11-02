## 2026-11-02 - lambforge-agent-skill: gcli build reads lambforge.yaml and works without tsconfig; environment flags sent as numbers without --spec; unset lambda scale values left to the plan

**Feature:** lambforge-agent-skill · **Type:** fix

From the static-hosting handover (an agent needed 9 attempts; graphql-server
plan 16 C5-C8):

- `commands/build/index.ts`: no commander defaults for files / bundle /
  minify / target / outfile, so `build.ts`'s fallback runs: flag ->
  `lambforge.yaml` (`function.file`, `options.bundler.*`) -> index.ts /
  bundle / `node24` / index.js. The `-t node14.4` default used to win over the
  yaml every time. `build.ts`: the decorators plugin only when a
  `tsconfig.json` exists (`[plugin: tsc] failed to open 'undefined'`).
- `commands/environment/environment-payload.ts`: create/update send numeric
  flags as numbers (`--poolSize 0` was `"0"` -> `Expected type Int`), drop
  the CLI-only `spec` / `project` / `clusterName` (`Field "spec" is not
  defined`), and refuse a non-number with the flag name.
- `commands/lambda/helpers/index.ts`: unset `concurrency`,
  `functionTimeout`, `specializationTimeout` are sent as 0 - the server fills
  them in within the plan. The fixed 500 / 60 / 120 were refused on plans
  with lower maxima.
- **Test:** `npx jest --coverage=false test/environment-payload.spec.ts`;
  manual: a project with only `src/main.ts` + `lambforge.yaml`
  (`file: ./src/main.ts`, `outfile: out.js`) -> `gcli build` writes `out.js`.
- **Debug:** `gcli build` bundling the wrong file = a flag or yaml field
  overrides it (`--files` wins); `Expected type Int` from environment
  commands = an old gcli.
- **Verification:** 133/133 tests, `tsc --noEmit` + eslint clean; the manual
  build above ran on the rebuilt `release/index.js`.
