# Self-managed nodes - gcli slice

**Status:** built 2026-10-29, uncommitted, ADMIN only. Feature slug
`self-managed-nodes`. Canonical doc: graphql-server-functions
`docs/features/self-managed-nodes.md`; design and later phases: graphql-server
`docs/plans/14-self-managed-nodes.md`.

A machine you own, booted from the Talos ISO, joins one of the platform's
Talos clusters as an extra worker over KubeSpan.

## Commands

| Command | What it does |
|---|---|
| `cluster:attach --cluster <id> --node-ip <lan-ip> --name home-1 --disk /dev/x [--pool p] [--reserved] [--yes] [--no-wait] [--timeout m]` | Probes the machine, shows its disks, refuses to go on without `--disk` (the cluster default is a Hetzner `/dev/sda`, often the boot USB stick at home), asks before the wipe, gets the join config (`clusterNodeJoinConfig`), applies it with `talosctl apply-config --insecure` from a 0600 temp file, waits until `ready` |
| `cluster:nodes --cluster <id>` | Every node: Hetzner control planes + workers and attached machines, with role, source (hetzner / own), status (`, paused` when cordoned) - the dashboard's Nodes card list |
| `cluster:pause` / `cluster:resume --cluster <id> --name home-1` | Cordon / uncordon an attached machine: paused, nothing new runs there and running work stays. Hetzner nodes are refused |
| `cluster:detach --cluster <id> --name home-1` | Drain + remove (Hetzner nodes are refused server-side); prints the reset command |

`--cluster` is the cluster's Mongo id; `--project <p> --clusterName <name>`
works instead.

## Files

- `src/commands/cluster/attach.ts`, `nodes.ts`, `pause.ts` (`pause` / `resume`), `detach.ts`; pure helpers in
  `helpers/attach.ts` (`parseAttachOptions`, `serverTalosVersion`,
  `nodeRow`, `resetHint`); registration in `src/commands/cluster/index.ts`.
- Client: `clusterAttachInfo`, `clusterNodeJoinConfig`, `clusterNodes`,
  `detachClusterNode`, `setClusterNodePaused` in `src/services/gql-client.ts`. `clusterNodes(id, includeCloud)`: `cluster:nodes` passes `true`, the attach wait loop `false`.
- **Reset hint** (after detach / a failed join): `talosctl --talosconfig <cluster talosconfig> -n <ip> -e <ip> reset --graceful=false --reboot --system-labels-to-wipe STATE --system-labels-to-wipe EPHEMERAL`. A joined machine refuses `--insecure`, and a plain reset also wipes the boot loader.

## Test

`npx jest test/cluster-attach --coverage=false`. Manual: boot a machine from
the ISO, run `cluster:attach` from the same LAN.

## Debug

- **"No Talos installer answers"**: gcli runs
  `talosctl -n <ip> get version --insecure -o yaml` (12 x 5 s). Run it by
  hand. `talosctl version --insecure` is NOT usable: maintenance mode
  answers it with "API is not implemented in maintenance mode" (seen on the
  machine console as `Unimplemented [/machine.MachineService/Version]`).
- Needs `talosctl` on PATH and the machine on port 50000 of the same network.
