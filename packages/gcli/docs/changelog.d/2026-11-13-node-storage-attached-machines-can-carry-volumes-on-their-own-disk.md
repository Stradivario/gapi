## 2026-11-13 - node-storage: Attached machines can carry volumes on their own disk

**Feature:** node-storage · **Type:** feat

- `cluster:attach --storage`; new `cluster:node-storage --name <machine>
  [--off] [--no-wait] [--timeout]` (follows the platform's steps);
  `cluster:nodes` shows a `storage` column.
- `cluster.machines` in the cluster spec (`lambforge.yaml` / cluster.yaml):
  `cluster:apply` turns storage on / off for attached machines and prints
  the attach command for the others (`helpers/machines.ts`, `apply.ts`).
- `GraphqlClienAPI.setClusterNodeStorage`, `storage` on the join config and
  the node fragment.
- **Test:** `npx jest test/cluster` (`cluster-machines.spec.ts` new).
- **Debug:** `gcli cluster:nodes`; server side in graphql-server-functions
  `docs/features/node-storage.md`.
- **Verification:** 5 cluster suites / 49 tests pass, tsc + eslint clean.
  Not run against a live API.
