## 2026-11-20 - time-triggers-yaml: lambda create and update apply triggers.time

**Feature:** time-triggers-yaml · **Type:** feat

- `lambda:create` / `lambda:update` now apply `triggers.time` of
  lambforge.yaml: create the time trigger, keep it when name + cron match,
  replace it when they differ (one per lambda). No block = no change. The
  `triggers` block used to be dropped with everything outside `function`.
- **Test:** `npx jest test/time-trigger-yaml.spec.ts` (4 cases: no block,
  create, same, replace on name or cron).
- **Debug:** the deploy prints `Time trigger ... created / is up to date /
  replaced by ...`; a failure prints `triggers.time was not applied`.
- **Verification:** local build `lambda:update` on graphql-server-functions
  `platform-tick` (2026-11-20): "Time trigger platform-tick-every-10m
  (*/10 * * * *) is up to date", trigger unchanged in production. All 12
  packages with `triggers.time` compared with production first: log-retention
  (`@daily` vs `0 3 * * *`) and workspace-gc (no trigger yet) fixed in their
  yaml so nothing is replaced or created by surprise.
