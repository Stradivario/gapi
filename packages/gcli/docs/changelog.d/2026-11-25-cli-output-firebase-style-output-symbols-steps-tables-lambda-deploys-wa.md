## 2026-11-25 - cli-output: Firebase-style output: symbols, steps, tables; lambda deploys wait for the build

**Feature:** cli-output · **Type:** feat

- New `src/services/ui.ts` (no dependency, `node:util` styleText): `i ✔ ⚠ ✖`
  lines with a bold coloured scope, `=== header`, `step()` operator with a
  spinner on a terminal, `ui.done` + `ui.summary`, kubectl-style
  `ui.table`. Colour only on a TTY (`NO_COLOR` / `FORCE_COLOR`), no spinner
  in CI. `Logger` now renders through it (all ~350 calls); the `-----` /
  `[Action][x]` banners are removed from 41 commands.
- `lambda:create` / `lambda:update` rewritten as steps (RxJS, no
  async/await): archive packed (files, size) -> uploaded -> saved -> waits
  for the build + rollout (`deployStatus` / `getLambdaBuildStatus`, 3 s
  poll, 15 min cap) -> triggers -> domains -> `Deploy complete!` + URL / Site
  / Logs. A failed build prints the log tail and exits 1 (`ReportedError`).
  New `--no-wait` (old behaviour) and `--json` (lambda JSON on stdout). The
  full lambda JSON is no longer dumped. The upload checks the HTTP answer.
- `GraphqlClienAPI.getProject` returned `res.listProjects` (always
  undefined) - now `res.getProject`; `getLambdaBuildStatus` added.
- **Test:** `npx jest --coverage=false` (new `test/ui.spec.ts`, 7 tests).
  By hand: a command in a terminal, then the same `| cat` - no escape codes,
  one line per step.
- **Debug:** escape codes in a CI log = `FORCE_COLOR` set there; a deploy
  that "hangs" = waiting for the build (shows the status; `--no-wait` to
  skip); a wrong exit code after a failed build = `ReportedError` not
  reaching `exitWithError`. `GCLI_DEBUG=1` prints error stacks.
- **Verification:** tsc + eslint clean; jest 29 suites / 246 tests;
  `npm run build`; a scripted run of the deploy steps through the real
  `ui` in a pseudo-terminal and piped (screenshot in the session). Not yet
  run against a real deploy.
