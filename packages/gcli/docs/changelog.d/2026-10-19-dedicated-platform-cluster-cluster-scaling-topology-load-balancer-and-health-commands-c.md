## 2026-10-19 - dedicated-platform-cluster: Cluster scaling, topology, load balancer and health commands (cluster:status, health, scale, autoscale, ...)

**Feature:** dedicated-platform-cluster · **Type:** feat

- New commands (the dashboard cluster page's actions, same
  cluster-provisioner operations): `cluster:status`, `cluster:health`,
  `cluster:scale-events`, `cluster:cost`, `cluster:scale --workers`,
  `cluster:scale:control-planes --count`, `cluster:multi-node`,
  `cluster:single-node`, `cluster:autoscale` (partial: only the given
  flags change), `cluster:load-balancer --enable|--disable`. All take
  `--cluster <id>` or `--clusterName <name>`; mutations take `--wait`
  (polls until ready; ending in `error` exits non-zero with the reason).
- `cluster:apply [--spec] [--dry-run] [--yes]`: the `cluster:` section of
  lambforge.yaml / cluster.yaml is now a desired state (new keys
  `controlPlanes`, `loadBalancer`, `autoscale.*`; `singleNode`, `workers`
  as before). It creates the cluster when missing (in the desired shape)
  and otherwise plans and applies topology → workers → control planes →
  load balancer → autoscale, waiting for `ready` between jobs; destructive
  steps need `--yes`. `cluster:create` also passes `controlPlanes` and
  `loadBalancer` from the spec now.
- Client-side checks mirror the server's bounds (workers 1-10, control
  planes 1/3/5, autoscale ranges) so a bad value fails before any request.
- `README.md` Private Clusters section, regenerated `README-CLI.md`.
- **Test:** `npx jest --coverage=false` (71 tests; new
  `test/cluster-scaling.spec.ts`, `test/cluster-apply.spec.ts` (the plan),
  `test/cluster-apply-command.spec.ts` (dry-run, `--yes`, create, refusals)).
- **Debug:** slice doc `docs/features/dedicated-platform-cluster.md`.
- **Verification:** jest 71/71; the built binary's `cluster:apply` read a
  real lambforge.yaml and rejected `controlPlanes: 2` before any request; tsc + eslint clean; `npm run build` and
  `--help` checked for every command (`release/index.js` restored after,
  not a release).
