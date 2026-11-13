# node-storage - gcli slice

**Status:** built 2026-11-13, uncommitted. Canonical doc:
graphql-server-functions `docs/features/node-storage.md`.

| Command | What it does |
|---|---|
| `cluster:attach ... --storage` | The machine installs Talos with the storage extensions and carries volumes once it joined (default: lambdas only) |
| `cluster:node-storage --cluster <id> --name home-1 [--off] [--no-wait] [--timeout m]` | Turns storage on for an attached machine (it may restart once; the platform does it, gcli only follows the steps) or off with `--off` (refused while it holds a volume) |
| `cluster:nodes` | New `storage` column: `yes`, `preparing: <step>`, `failed: <why>` |
| `cluster:apply` | Reads `cluster.machines` (below) |

```yaml
cluster:
  name: home-lab
  machines:
    - name: home-1
      storage: true      # carries volumes
    - name: home-2       # listed, left as it is
```

`cluster:apply` only changes `storage` of machines that are attached, one
at a time, waiting for each; turning it off needs `--yes`. A machine that
is not attached is reported with the `cluster:attach` command to run from
its network - apply never attaches or detaches. Machines not in the list
are not touched. Not valid for a virtual cluster.

Code: `src/commands/cluster/node-storage.ts`, `helpers/machines.ts` (pure:
`validateMachines`, `planMachines`, `attachHint`, `storageCell`), `apply.ts`
(`applyMachines`). Test: `npx jest test/cluster-machines.spec.ts`.

Needs the cluster-provisioner with `setClusterNodeStorage` deployed first -
an older one rejects the new `storage` fields of `cluster:nodes`.
