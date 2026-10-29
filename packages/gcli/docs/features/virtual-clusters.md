# Virtual clusters (slice)

**Status:** in production since 2026-10-28 (shared cluster host, subdomain routing, dedicated LB add-on, token kubeconfig). Feature slug `virtual-clusters`.
Canonical doc (how it works, test, debug, limits):
[`graphql-server-functions/docs/features/virtual-clusters.md`](../../../../../graphql-server-functions/docs/features/virtual-clusters.md).

Virtual clusters are vClusters (own Kubernetes API + Fission) on the shared
cluster or one of the project's private clusters, `provider: 'vcluster'`.

## This repo

- `gcli cluster:create --virtual [--host <private-cluster>] [--dedicated-lb]`;
  in `lambforge.yaml`: `cluster: { name: dev, provider: vcluster, host: prod,
  loadBalancer: true }` for `cluster:create` / `cluster:apply` (no host =
  shared cluster; node settings are rejected).
- `loadBalancer` on a virtual cluster = its **dedicated** LB (own IP,
  billed). `cluster:apply` creates with it in one step, later adds/removes it
  (removal is destructive -> needs `--yes`); `cluster:load-balancer
  --enable|--disable` does the same by hand (the backend routes
  enable/disableLoadBalancerProjectCluster to the vCluster re-apply).
- `cluster:list` columns: `type`, `router` (lambda base URL, the
  `vc-<id>` subdomain), `api` (endpoint - `k-<id>` for vClusters on the
  shared host), `loadBalancer` (IP / pending / off). `ClusterFragment`
  selects `routerUrl withLoadBalancer loadBalancerIp`.
- Code: `src/commands/cluster/helpers/virtual-cluster.ts`, `helpers/plan.ts`,
  `create.ts`, `apply.ts`, `list.ts`. Test: `npx jest --coverage=false test/cluster-apply`.
