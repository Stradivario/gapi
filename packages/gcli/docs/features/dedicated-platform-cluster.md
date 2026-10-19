# dedicated-platform-cluster (gcli slice)

**Canonical doc:** `lambforge-agent/docs/features/dedicated-platform-cluster.md`
· **Since:** 2026-10-19 (cluster scaling and health commands)

The cluster page's scaling, topology, load balancer and health actions as
commands (cluster-provisioner operations, the same ones gql-fission's
`core/services/cluster/*.graphql` use; every one is USER-enabled with
`isMemberOrProjectOwner`):

| Command | Operation |
|---|---|
| `cluster:status [--cluster]` | `projectClustersOverview` (status, agent, nodes, load, autoscale, issues) |
| `cluster:health --cluster` | `clusterHealth(limit: 1)` - latest agent report + nodes |
| `cluster:scale-events --cluster [--limit]` | `clusterScaleEvents` |
| `cluster:cost` | `projectClustersOverview` (`monthToDate`, `estimatedMonthlyCostEur`) |
| `cluster:scale --workers 1-10 [--wait]` | `scaleProjectCluster` |
| `cluster:scale:control-planes --count 1/3/5 [--wait]` | `scaleControlPlanesProjectCluster` |
| `cluster:multi-node --workers [--wait]` / `cluster:single-node [--wait]` | `migrateToMultiNodeProjectCluster` / `revertToSingleNodeProjectCluster` |
| `cluster:autoscale [--enable/--disable] [--min --max --cpuUp --memUp --cpuDown --memDown --samples --cooldown]` | `updateProjectClusterAutoscale` - partial: the server merges it into the stored policy and validates (min <= max, scale-down below scale-up, single-node cannot autoscale) |
| `cluster:load-balancer --enable/--disable [--wait]` | `enable/disableLoadBalancerProjectCluster` |
| `cluster:apply [--spec] [--dry-run] [--yes]` | reconciles the `cluster:` section of lambforge.yaml: `projectClusters` (current) → plan → provision / topology / scale / control planes / load balancer / autoscale, one job at a time, waiting for `ready` between them |

## Declarative clusters (`cluster:apply`)

`cluster:` keys: `name` (identity), `imageId` / `serverType` / `location`
(create only), `singleNode`, `workers` (1-10), `controlPlanes` (1/3/5),
`loadBalancer`, `autoscale.{enabled,minWorkers,maxWorkers,cpuScaleUpPercent,
memScaleUpPercent,cpuScaleDownPercent,memScaleDownPercent,samplesToScale,
cooldownMinutes}`. Missing keys are left alone.

- `helpers/plan.ts` `planClusterChanges(current, desired)` is pure (unit
  tested): create in the desired shape (workers, control planes, load
  balancer at provision time) then autoscale; otherwise topology → workers
  → control planes → load balancer → autoscale (only the changed keys).
- `workers` is skipped while `autoscale.enabled` (the autoscaler owns it);
  converting to multi-node already creates the workers.
- Destructive steps (to single-node, removing the load balancer) need
  `--yes`; without it they are printed and skipped.
- `validateDesired` mirrors the server's bounds; a cluster that is not
  `ready` is refused (apply again once it settles).

## Files

| Path | Responsibility |
|---|---|
| `src/commands/cluster/index.ts` | registration (`--cluster` / `--clusterName` on every one) |
| `src/commands/cluster/{status,health,scale-events,cost,scale,scale-control-planes,autoscale,multi-node,single-node,load-balancer}.ts` | actions |
| `src/commands/cluster/helpers/cluster-change.ts` | target resolution, int validation, mutate → print → `--wait` (`pollUntilReady`; ends in `error` → non-zero exit) |
| `src/commands/cluster/types.ts` | local types + selections (newer than `@introspection`) |
| `src/services/gql-client.ts` | the API calls |

## How to test

`npx jest --coverage=false test/cluster-scaling.spec.ts`; manually against a
project with a private cluster: `gcli cluster:status`, then
`gcli cluster:scale --clusterName <n> --workers 2 --wait`.

## How to debug

| Symptom | Look at |
|---|---|
| "Pass --cluster <id> or --clusterName" | no cluster given; `gcli cluster:list` |
| autoscale refused | the server's message: single-node clusters must `cluster:multi-node` first; external clusters cannot autoscale |
| `--wait` ends in error | `gcli cluster:list` (status + error), the dashboard's cluster page |

## Not in the CLI yet

Resource migration between clusters (`migrateResourcesToCluster` + status /
retry), Fission options, the cluster agent install/rotate - dashboard only.
