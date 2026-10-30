/**
 * Pure helpers for gcli cluster:attach / cluster:nodes / cluster:detach
 * (feature self-managed-nodes). No I/O - unit-tested in
 * test/cluster-attach.spec.ts.
 */
import { ClusterNode } from '../types';

export interface AttachOptions {
  project?: string;
  cluster?: string;
  clusterName?: string;
  nodeIp?: string;
  name?: string;
  pool?: string;
  reserved?: boolean;
  disk?: string;
  yes?: boolean;
  wait?: boolean;
  timeout?: string;
}

export const NAME_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const POOL_RE = /^[a-z0-9]([a-z0-9-]{0,30}[a-z0-9])?$/;
const DISK_RE = /^\/dev\/[A-Za-z0-9/_-]+$/;
export const HOST_RE = /^[A-Za-z0-9.:-]+$/;

/** The validated inputs of cluster:attach, or a readable error. */
export function parseAttachOptions(cmd: AttachOptions) {
  const nodeIp = (cmd.nodeIp ?? '').trim();
  const name = (cmd.name ?? '').trim();
  const pool = (cmd.pool ?? '').trim() || undefined;
  const disk = (cmd.disk ?? '').trim() || undefined;
  if (!nodeIp || !HOST_RE.test(nodeIp)) {
    throw new Error(
      "--node-ip is required: the machine's address on your network, shown on its screen after booting the Talos ISO (e.g. 192.168.1.50)",
    );
  }
  if (!NAME_RE.test(name)) {
    throw new Error(
      '--name is required: lowercase letters, digits and dashes (it becomes the machine hostname, e.g. home-1)',
    );
  }
  if (pool && !POOL_RE.test(pool)) {
    throw new Error('--pool: lowercase letters, digits and dashes (max 32)');
  }
  if (disk && !DISK_RE.test(disk)) {
    throw new Error('--disk must look like /dev/nvme0n1 or /dev/sda');
  }
  const timeoutMinutes = cmd.timeout === undefined ? 10 : Number(cmd.timeout);
  if (
    !Number.isFinite(timeoutMinutes) ||
    timeoutMinutes < 1 ||
    timeoutMinutes > 60
  ) {
    throw new Error('--timeout is in minutes, 1 to 60');
  }
  return {
    nodeIp,
    name,
    pool,
    disk,
    reserved: !!cmd.reserved,
    yes: !!cmd.yes,
    wait: cmd.wait !== false,
    timeoutMs: timeoutMinutes * 60_000,
  };
}

/** The machine's Talos version from
    `talosctl -n <ip> get version --insecure -o yaml` (spec.version).
    `talosctl version --insecure` cannot be used: a machine in maintenance
    mode answers it with "API is not implemented in maintenance mode". */
export function serverTalosVersion(output: string): string | undefined {
  const spec = output.split(/^spec:/m)[1];
  return spec?.match(/^\s+version:\s*(v[\d.]+\S*)/m)?.[1];
}

/** One row of cluster:nodes - a Hetzner node or an attached machine. */
export const nodeRow = (n: ClusterNode) => {
  const own = n.source !== 'hetzner';
  return {
    node: n.name,
    role: n.role === 'control-plane' ? 'control plane' : 'worker',
    source: own ? 'own' : 'hetzner',
    status: n.cordoned ? `${n.status}, paused` : n.status,
    pool: own ? (n.pool ?? '-') : '-',
    use: own ? (n.reserved ? 'reserved' : 'capacity') : '-',
    ip: n.internalIp ?? '-',
    cpu: n.cpuCores ?? '-',
    memoryGb: n.memoryGb ?? '-',
    talos: n.osImage ?? '-',
    joined: n.joinedAt ?? '-',
    ...(own && !n.recorded ? { note: 'joined by hand' } : {}),
  };
};

/** How to bring a machine back to maintenance mode (to attach it again):
    gcli wipes only its config and data and keeps the boot loader. */
export const resetHint = (
  clusterId = '<cluster-id>',
  name = '<machine-name>',
  ip = '<machine-ip>',
) =>
  `gcli cluster:reset-machine --cluster ${clusterId} --name ${name} --node-ip ${ip}`;
