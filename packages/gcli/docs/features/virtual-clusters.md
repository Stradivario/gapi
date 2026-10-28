# Virtual clusters (slice)

**Status:** built and tested end to end on minikube 2026-10-28, not deployed. Feature slug `virtual-clusters`.
Canonical doc (how it works, test, debug, limits):
[`graphql-server-functions/docs/features/virtual-clusters.md`](../../../../../graphql-server-functions/docs/features/virtual-clusters.md).

Virtual clusters are vClusters (own Kubernetes API + Fission) on the shared
cluster or one of the project's private clusters, `provider: 'vcluster'`.

## This repo

`gcli cluster:create --virtual [--host <private-cluster>]`; in `lambforge.yaml`: `cluster: { name: dev, provider: vcluster, host: prod }` for `cluster:create` / `cluster:apply` (no host = shared cluster; node settings are rejected). Code: `src/commands/cluster/helpers/virtual-cluster.ts`, `helpers/plan.ts`. Test: `npx jest --coverage=false test/cluster-apply`.
