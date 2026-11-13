/**
 * Pure helpers for machine storage (feature node-storage): the `machines:`
 * list of a cluster spec and what `cluster:apply` does about it. No I/O -
 * unit-tested in test/cluster-machines.spec.ts.
 */
import { ClusterNode } from '../types';

/** a machine name = hostname (same rule as cluster:attach) */
const NAME_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

/** One attached machine in the `cluster.machines` list of lambforge.yaml. */
export interface MachineDesired {
  /* Machine name = hostname (as given to cluster:attach). */
  name: string;
  /* The machine carries volumes on its own disk. Omitted = left as it is. */
  storage?: boolean;
  /* Only read by the attach hint - an attached machine keeps its own. */
  pool?: string;
  reserved?: boolean;
}

export interface MachineStep {
  kind: 'machine-storage';
  name: string;
  enabled: boolean;
  description: string;
  destructive?: true;
}

export const validateMachines = (machines: unknown): string[] => {
  if (machines === undefined) return [];
  if (!Array.isArray(machines)) return ['cluster.machines must be a list'];
  const errors: string[] = [];
  const seen = new Set<string>();
  machines.forEach((m: MachineDesired, i) => {
    const at = `cluster.machines[${i}]`;
    if (!m || typeof m.name !== 'string' || !NAME_RE.test(m.name)) {
      errors.push(
        `${at}.name must be the machine's name (lowercase, digits, dashes)`,
      );
      return;
    }
    if (seen.has(m.name)) errors.push(`${at}.name "${m.name}" is listed twice`);
    seen.add(m.name);
    if (m.storage !== undefined && typeof m.storage !== 'boolean') {
      errors.push(`${at}.storage must be true or false`);
    }
  });
  return errors;
};

/** How to attach a machine of the spec that is not in the cluster yet -
    apply cannot do it: it needs the machine's address and wipes a disk. */
export const attachHint = (m: MachineDesired, clusterId = '<cluster-id>') =>
  [
    `gcli cluster:attach --cluster ${clusterId} --name ${m.name} --node-ip <ip> --disk <disk>`,
    m.pool ? `--pool ${m.pool}` : '',
    m.reserved ? '--reserved' : '',
    m.storage ? '--storage' : '',
  ]
    .filter(Boolean)
    .join(' ');

const hasStorage = (n: ClusterNode) =>
  n.storage === 'ready' || n.storage === 'preparing';

/**
 * Storage changes for the machines of the spec that are attached; machines
 * that are not attached become notes with the command to attach them.
 * Machines not in the spec are never touched.
 */
export function planMachines(
  desired: MachineDesired[] | undefined,
  nodes: ClusterNode[],
  clusterId?: string,
): { steps: MachineStep[]; notes: string[] } {
  const steps: MachineStep[] = [];
  const notes: string[] = [];
  for (const machine of desired ?? []) {
    const node = nodes.find(
      (n) => n.name === machine.name && n.source !== 'hetzner',
    );
    if (!node || node.status === 'detached') {
      notes.push(
        `machine "${machine.name}" is not attached - run from its network: ${attachHint(machine, clusterId)}`,
      );
      continue;
    }
    if (machine.storage === undefined) continue;
    if (machine.storage && node.storage === 'preparing') {
      notes.push(`machine "${machine.name}": storage is being prepared`);
      continue;
    }
    if (machine.storage && node.storage !== 'ready') {
      steps.push({
        kind: 'machine-storage',
        name: machine.name,
        enabled: true,
        description: `turn storage on for ${machine.name} (it may restart once)${node.storage === 'failed' ? ' - retry' : ''}`,
      });
    } else if (!machine.storage && hasStorage(node)) {
      steps.push({
        kind: 'machine-storage',
        name: machine.name,
        enabled: false,
        description: `turn storage off for ${machine.name}`,
        destructive: true,
      });
    }
  }
  return { steps, notes };
}

/** The storage cell of cluster:nodes. */
export const storageCell = (n: ClusterNode): string =>
  n.source === 'hetzner' || !n.storage || n.storage === 'off'
    ? '-'
    : n.storage === 'ready'
      ? 'yes'
      : n.storageMessage
        ? `${n.storage}: ${n.storageMessage}`
        : n.storage;
