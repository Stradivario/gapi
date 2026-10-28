## 2026-10-27 - virtual-clusters: cluster:create --virtual and provider vcluster in cluster:apply

**Feature:** virtual-clusters · **Type:** feat

- `cluster:create --virtual [--host <private-cluster-name>]` and, in the
  `cluster:` section, `provider: vcluster` + `host:` (both read by
  `cluster:create` and `cluster:apply`). The host is resolved by name
  (`helpers/virtual-cluster.ts`); no host = the shared cluster.
  `cluster:apply` only creates a virtual cluster - nothing else to reconcile;
  `validateDesired` rejects node settings on it and `host` without it.
- `GraphqlClienAPI.provisionProjectVirtualCluster` selects `routerUrl` and
  `hostNamespace` itself (not in `ClusterFragment`, so older servers keep
  working). Canonical doc: `graphql-server-functions/docs/features/virtual-clusters.md`.
- **Test:** `npx jest --coverage=false test/cluster-apply`.
- **Debug:** `No cluster named "<host>"` = the host name is not a live
  cluster of the project (`gcli cluster:list`).
- **Verification:** jest 118/118 (4 new), tsc + eslint clean. README-CLI.md
  not regenerated (needs a build of release/index.js).
