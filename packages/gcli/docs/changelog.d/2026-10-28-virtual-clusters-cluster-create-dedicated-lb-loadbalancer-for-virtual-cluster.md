## 2026-10-28 - virtual-clusters: cluster:create --dedicated-lb, loadBalancer for virtual clusters, cluster:list URLs

**Feature:** virtual-clusters · **Type:** feat

- `cluster:create --virtual --dedicated-lb` -> provisionProjectVirtualCluster
  `dedicatedLoadBalancer`; `lambforge.yaml` `loadBalancer: true` on a
  `provider: vcluster` cluster is now accepted (no longer in
  VIRTUAL_UNSUPPORTED): created with it, later added/removed by
  `cluster:apply` (removal = destructive, `--yes`).
- `cluster:load-balancer` help explains the virtual case (dedicated LB, the
  subdomain stays) - the backend already handles vClusters.
- `cluster:list`: type, router (lambda URL), api, loadBalancer columns;
  `ClusterFragment` + `routerUrl withLoadBalancer loadBalancerIp`.
- README virtual-clusters section, README-CLI regenerated (it was also
  missing --virtual/--host), public docs gcli page + What's new.
- **Test:** `npx jest --coverage=false test/cluster-apply` (plan: create
  with LB in one step, add, destructive remove; command: spec ->
  `dedicatedLoadBalancer: true`).
- **Debug:** `gcli cluster:apply --dry-run` prints the planned LB step;
  `cluster:list` shows `loadBalancer` pending while the re-apply runs.
- **Verification:** 119/119 tests, tsc clean, eslint clean; built CLI shows
  `--dedicated-lb` in `cluster:create --help`. Not run against a live
  server (gcli is logged into production).
