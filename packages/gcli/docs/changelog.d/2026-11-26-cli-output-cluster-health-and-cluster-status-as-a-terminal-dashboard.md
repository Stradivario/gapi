## 2026-11-26 - cli-output: cluster:health and cluster:status as a terminal dashboard

**Feature:** cli-output · **Type:** feat

- `cluster:health` draws a dashboard (`helpers/health-view.ts`): header
  (overall, size, agent, last report), CPU/memory requested and used as
  bars with "2.7 of 6 CPU", pods/runtime/prometheus, a bar per node, the
  open issues. One request (`clusterHealthView`). `--watch [seconds]`
  redraws (`ui.redraw`), `--json` prints `{ overview, latest }`.
- `cluster:status`: per cluster the same header, two compact bars and its
  issues instead of a wide table; `--json`.
- `types.ts` `ClusterOverviewFragment` selects `health { usageSource
  capacity }`; `ui.ts` exports `unicode` and adds `ui.redraw`.
- **Test:** `npx jest test/cluster-health-view.spec.ts`; `gcli cluster:health
  --cluster <id>` in a terminal and `| cat`; `--watch 5` for a few frames.
- **Debug:** no "of N CPU" = `health.capacity` is null (heartbeat older
  than the platform change); `--json` shows the raw data.
- **Verification:** gcli jest 275/275, tsc + eslint clean; run against prod
  for instance-stage (vCluster, 2.7 of 6 CPU, `(host)` usage) and
  cluster-1d570007-c7vx (4 nodes with bars), `--watch 5` drew 3 frames in
  12 s, `--json` parsed.
