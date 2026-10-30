## 2026-10-30 - self-managed-nodes: cluster:attach probes the machine with talosctl get version (maintenance mode refuses talosctl version)

**Feature:** self-managed-nodes · **Type:** feat

- **`cluster:attach` / `cluster:nodes` / `cluster:detach`** (built 2026-10-29,
  first recorded here): attach your own machine to a Talos cluster.
  `src/commands/cluster/attach.ts`, `nodes.ts`, `detach.ts`,
  `helpers/attach.ts`.
- **Fix:** the machine probe now runs
  `talosctl -n <ip> get version --insecure -o yaml` and reads `spec.version`.
  It used `talosctl version --insecure`, which a machine in maintenance mode
  refuses ("API is not implemented in maintenance mode"), so attach always
  failed with "No Talos installer answers".
- **`--disk` is now required** (checked after the disk list is shown):
  without it Talos used the disk in the cluster's worker.yaml, a Hetzner
  `/dev/sda`, which on the first real machine was the boot USB stick.
- **`cluster:nodes` lists every node** (Hetzner control planes + workers and
  attached machines, columns node / role / source / status ...), like the
  dashboard's Nodes card. New **`cluster:pause` / `cluster:resume --name`**
  (`pause.ts`, `setClusterNodePaused`).
- **Reset hint fixed:** it said `talosctl reset --insecure`, which a joined
  machine refuses, and a plain reset wipes the boot loader too (it left the
  first real machine unbootable). It now wipes only STATE + EPHEMERAL with the
  cluster's talosconfig.
- **Test:** `npx jest test/cluster-attach --coverage=false`.
- **Debug:** run the probe by hand against the machine's LAN IP; see
  `docs/features/self-managed-nodes.md`.
- **Verification:** live on cluster 6ae44580678d8012d02aee58: `cluster:nodes` listed the control plane (94.130.96.226) and home-1; pause showed `ready, paused`, resume cleared it; pausing the control plane was refused. Full gcli suite 123/123. Earlier: 4/4 specs pass, tsc + eslint clean, build ok. The new
  probe was run against a real machine in maintenance mode (Talos v1.12.7)
  and its output parses to `v1.12.7`; `get disks --insecure` also answers.
