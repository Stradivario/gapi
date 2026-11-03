## 2026-11-03 - dedicated-platform-cluster: cluster:plan; cluster:autoscale --mode/--consolidation/--minNodeAge; pools in YAML

**Feature:** dedicated-platform-cluster · **Type:** feat

- `gcli cluster:plan --cluster <id>` (`commands/cluster/plan.ts`): why pods
  are pending (a verdict per pod), the nodes pods mode would create with
  the monthly price, and the consolidation decision. Read-only, any mode.
- `cluster:autoscale` has three new flags:
  - `--mode thresholds|pods`;
  - `--consolidation` / `--no-consolidation`;
  - `--minNodeAge <minutes>` (5-1440).
- `cluster.autoscale` in YAML accepts `mode`, `consolidation`,
  `minNodeAgeMinutes` and `pools` (up to 5:
  `{ name, serverTypes, labels, taints, maxWorkers, weight }`).
  `cluster:apply` diffs pools as a list.
- **Test:** `npx jest --coverage=false test/cluster-scaling.spec.ts
  test/cluster-apply.spec.ts`.
- **Debug:** "Cannot query field mode/pools" means cluster-provisioner is
  older than this gcli.
- **Verification:** 141 tests passed. tsc and eslint are clean.
