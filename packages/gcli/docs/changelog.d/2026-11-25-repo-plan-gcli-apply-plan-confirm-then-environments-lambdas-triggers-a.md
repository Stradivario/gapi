## 2026-11-25 - repo-plan: gcli apply: plan, confirm, then environments, lambdas, triggers and domains from every lambforge.yaml

**Feature:** repo-plan · **Type:** feat

- New `gcli apply [path]` (`src/commands/repo/apply.ts`, pure decisions in
  `apply-work.ts`): the plan, a `[y/N]` question (`ui.confirm`; `--yes` for
  CI, refuses to wait without a terminal), then environments, lambdas (the
  lambda:update flow in a new `embedded` mode, waiting for each build),
  time triggers, domains and queue triggers. Never deletes, stops at the
  first failure. `--only <lambda>`, `--code` (redeploy lambdas in sync -
  code drift is not detected yet).
- `gcli plan` prints through the new shared `plan-view.ts` (lambda names,
  `field: now -> wanted`, in-sync units on one line).
- `applyMqTriggers` extracted from mq-trigger:apply (shared).
- Drift: lists are true sets - production lambdas list some secret names
  2-3 times, which flagged 25 of 27 functions as changed.
- `step()` prints its done line when the step completes, before the next
  part runs (was after it, or not at all when the next part failed).
- **Test:** `npx jest --coverage=false test/repo-apply test/repo-plan`.
  By hand: `gcli apply < /dev/null` in a repo shows the plan and stops at
  the question without changing anything.
- **Debug:** "no terminal to ask on" = CI without `--yes`; a lambda that
  never redeploys = code-only change, use `--code`; a deploy reading the
  wrong files = the unit folder (`inFolder`).
- **Verification:** jest 30 suites / 253 tests, tsc + eslint clean; on
  graphql-server-functions against production (read-only): 27 files, 26 in
  sync, 1 real change (workspace-gc scale settings), 8 unmanaged, stopped
  at the question. A real apply (writes) was not run.
