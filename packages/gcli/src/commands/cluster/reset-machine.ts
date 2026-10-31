import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createInterface } from 'readline';
import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { HOST_RE, NAME_RE } from './helpers/attach';
import {
  ClusterTargetOptions,
  resolveClusterTarget,
} from './helpers/cluster-change';
import { ensureTalosctl, runBinary } from './helpers/talosctl';

type ResetOptions = ClusterTargetOptions & {
  name?: string;
  nodeIp?: string;
  yes?: boolean;
};

/** The hostname a Talos machine reports (`get hostnamestatus -o yaml`). */
export const hostnameOf = (yaml: string): string | null =>
  yaml.match(/^\s*hostname:\s*(\S+)/m)?.[1] ?? null;

/**
 * gcli cluster:reset-machine - bring a machine you attached back to
 * maintenance mode, so it can be attached again: wipes only its config and
 * data (STATE + EPHEMERAL) and keeps the boot loader. It must be detached
 * first; Hetzner nodes are refused. Uses a 15-minute talosconfig in a
 * private temp file, deleted afterwards, and checks that the machine at
 * --node-ip really is --name before anything is wiped.
 */
export default async (cmd: ResetOptions) => {
  const name = (cmd.name ?? '').trim();
  const ip = (cmd.nodeIp ?? '').trim();
  if (!NAME_RE.test(name)) {
    throw new Error(
      '--name is required: the machine name (see gcli cluster:nodes)',
    );
  }
  if (!HOST_RE.test(ip)) {
    throw new Error(
      "--node-ip is required: the machine's address on your network",
    );
  }
  const { clusterId } = await resolveClusterTarget(cmd);

  const node = (
    await lastValueFrom(GraphqlClienAPI.clusterNodes(clusterId, true))
  ).find((n) => n.name === name);
  if (node?.source === 'hetzner') {
    throw new Error(
      `${name} is a Hetzner node - those are removed by scaling the cluster.`,
    );
  }
  if (node && (node.status === 'ready' || node.status === 'not-ready')) {
    throw new Error(
      `${name} is still in the cluster. Detach it first: gcli cluster:detach --cluster ${clusterId} --name ${name}`,
    );
  }

  const access = await lastValueFrom(
    GraphqlClienAPI.clusterTalosconfig(clusterId, 15),
  );
  const binary = access.talosVersion
    ? await ensureTalosctl(access.talosVersion)
    : 'talosctl';
  const dir = await mkdtemp(join(tmpdir(), 'gcli-reset-'));
  const config = join(dir, 'talosconfig');
  try {
    await writeFile(config, access.talosconfig, { mode: 0o600 });
    const talos = (args: string[], timeoutMs = 30_000) =>
      runBinary(
        binary,
        ['--talosconfig', config, '-e', ip, '-n', ip, ...args],
        timeoutMs,
      );

    const status = await talos(['get', 'hostnamestatus', '-o', 'yaml']);
    if (status.code !== 0) {
      throw new Error(
        `Cannot reach the machine at ${ip} with this cluster's credentials: ${(status.stderr || status.stdout).trim().split('\n')[0]}. It must be on this network and still configured for this cluster (a machine in maintenance mode needs no reset).`,
      );
    }
    const actual = hostnameOf(status.stdout);
    if (actual !== name) {
      throw new Error(
        `The machine at ${ip} is "${actual ?? 'unknown'}", not "${name}" - nothing was changed.`,
      );
    }

    if (!cmd.yes) {
      const answer = await new Promise<string>((resolve) => {
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question(
          `Wipe the config and data of ${name} (${ip})? It reboots into maintenance mode, ready to attach again. Type the machine name to continue: `,
          (a) => {
            rl.close();
            resolve(a.trim());
          },
        );
      });
      if (answer !== name) {
        Logger.warn('Cancelled - nothing was changed.');
        return;
      }
    }

    const reset = await talos(
      [
        'reset',
        '--graceful=false',
        '--reboot',
        '--wait=false',
        '--system-labels-to-wipe',
        'STATE',
        '--system-labels-to-wipe',
        'EPHEMERAL',
      ],
      60_000,
    );
    if (reset.code !== 0) {
      throw new Error(
        `Reset failed: ${(reset.stderr || reset.stdout).trim().split('\n')[0]}`,
      );
    }
    Logger.log(
      `${name} is resetting. In a few minutes its screen shows "Maintenance"; attach it again with gcli cluster:attach.`,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};
