## 2026-11-03 - dedicated-platform-cluster: cluster:autoscale --profile, --serverTypes, --step; cluster.autoscale YAML keys

**Feature:** dedicated-platform-cluster · **Type:** feat

- `gcli cluster:autoscale` has three new flags:
  - `--profile conservative|balanced|aggressive|custom`;
  - `--serverTypes cx33,cpx22`: comma-separated, lowercased; `""` or
    `none` clears the list;
  - `--step 1-3`.
  The result table shows the profile, worker types and step.
- `cluster.autoscale` in YAML accepts `scalingProfile`, `serverTypes` (a
  list of at most 10) and `scaleUpStep`. `cluster:apply` compares lists by
  value, so an unchanged list does not show up as a change.
- The fragment now asks for the new fields, so it needs a
  cluster-provisioner that has them.
- **Test:** `npx jest --coverage=false test/cluster-scaling.spec.ts
  test/cluster-apply.spec.ts`.
- **Debug:** "Cannot query field scalingProfile" means the API is older
  than this gcli: deploy cluster-provisioner first.
- **Verification:** 28 tests in those specs, 136 overall, all passed. tsc
  and eslint are clean.
