## 2026-10-31 - self-managed-nodes: Cluster commands call the API by cluster id; reset-machine works on platform clusters

**Feature:** self-managed-nodes · **Type:** feat

- `clusterKubeconfig`, `clusterTalosconfig`, `teardownProjectCluster` are
  sent with `clusterId` only - the server checks the cluster's own project
  (one API for users and admins). `cluster:reset-machine` and
  `cluster:talosconfig` no longer depend on the current project (free-host
  failed with missing-cluster).
- `cluster:teardown --wait`: a cluster that left the project list is
  deleted, not "not found".
- Needs cluster-provisioner with the optional `projectId` deployed first.
- **Test:** `npx jest --coverage=false` (126/126); `npm run esbuild`.
- **Debug:** "This is a platform cluster - only Lambforge admins can
  manage it" = the logged-in user is not an admin.
- **Verification:**
- **Real run (local stack, home-1 on the LAN, real Hetzner):** free-host
  (platform): reset-machine (the command that failed with missing-cluster),
  attach, detach, reset, attach again. A new single-node Talos cluster in
  the owner's `test` project: attach (KubeSpan from the LAN), kubeconfig +
  talosconfig by cluster id, detach, reset - home-1 left in maintenance
  mode; the test cluster torn down (status deleted, machine records gone).
  A plan-team USER: refused on free-host (also when sending its own
  projectId) and on the test project's cluster; its own project works.
