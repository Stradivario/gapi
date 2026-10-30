import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createInterface } from 'readline';
import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import {
  AttachOptions,
  nodeRow,
  parseAttachOptions,
  resetHint,
  serverTalosVersion,
} from './helpers/attach';
import { resolveClusterTarget } from './helpers/cluster-change';
import { ensureTalosctl, runBinary } from './helpers/talosctl';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ask = (question: string) =>
  new Promise<string>((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

/**
 * gcli cluster:attach - join a machine you own (booted from the Talos ISO,
 * on the network you run this from) to a Lambforge Talos cluster as an extra
 * worker. The platform hands out the machine's config; this applies it over
 * the LAN (Talos maintenance API, port 50000); the machine installs Talos,
 * reboots and dials out to the cluster over KubeSpan - no port forwarding.
 */
export default async (cmd: AttachOptions) => {
  const opts = parseAttachOptions(cmd);
  const { clusterId } = await resolveClusterTarget(cmd);

  const info = await lastValueFrom(
    GraphqlClienAPI.clusterAttachInfo(clusterId),
  );
  if (!info.attachable) {
    throw new Error(
      info.reason ?? 'Machines cannot be attached to this cluster.',
    );
  }

  // the cluster's own talosctl version - downloaded once when missing
  const binary = info.talosVersion
    ? await ensureTalosctl(info.talosVersion)
    : 'talosctl';
  const talosctl = (args: string[], timeoutMs = 20_000) =>
    runBinary(binary, args, timeoutMs);
  if ((await talosctl(['version', '--client'])).code !== 0) {
    throw new Error(
      'talosctl is not available. Install it: https://www.talos.dev/latest/talos-guides/install/talosctl/',
    );
  }

  Logger.info(`Looking for the Talos installer at ${opts.nodeIp}:50000 ...`);
  let version: string | undefined;
  for (let i = 0; i < 12 && !version; i++) {
    const probe = await talosctl([
      '-n',
      opts.nodeIp,
      'get',
      'version',
      '--insecure',
      '-o',
      'yaml',
    ]);
    version = probe.code === 0 ? serverTalosVersion(probe.stdout) : undefined;
    if (!version) await sleep(5_000);
  }
  if (!version) {
    throw new Error(
      `No Talos installer answers at ${opts.nodeIp}:50000. Boot the machine from the Talos ${info.talosVersion ?? ''} ISO (${info.isoUrl ?? 'https://github.com/siderolabs/talos/releases'}; ARM: ${info.isoUrlArm64 ?? '-'}) and run this from the same network.`,
    );
  }
  Logger.info(`Machine runs the Talos ${version} installer. Its disks:`);
  const disks = await talosctl([
    '-n',
    opts.nodeIp,
    'get',
    'disks',
    '--insecure',
  ]);
  Logger.log(disks.stdout || disks.stderr);

  // The cluster's worker.yaml names a Hetzner disk (/dev/sda), which on a
  // home machine is often the USB stick it booted from - never guess.
  if (!opts.disk) {
    throw new Error(
      `Pick the install disk from the list above and run again with --disk, e.g. --disk /dev/nvme0n1. It is WIPED. Nothing was changed.`,
    );
  }

  if (!opts.yes) {
    const answer = await ask(
      `Talos will WIPE ${opts.disk} on ${opts.nodeIp}. Type the machine name (${opts.name}) to continue: `,
    );
    if (answer !== opts.name) {
      Logger.warn('Cancelled - nothing was changed.');
      return;
    }
  }

  const join_ = await lastValueFrom(
    GraphqlClienAPI.clusterNodeJoinConfig({
      clusterId,
      name: opts.name,
      pool: opts.pool,
      reserved: opts.reserved,
      installDisk: opts.disk,
    }),
  );
  if (join_.talosVersion && join_.talosVersion !== version) {
    Logger.warn(
      `The cluster runs Talos ${join_.talosVersion}, the machine booted ${version}. It installs ${join_.talosVersion} anyway; if the join fails, boot ${join_.isoUrl}.`,
    );
  }

  // The config carries the cluster's join token: a private temp file that
  // only lives for the apply.
  const dir = await mkdtemp(join(tmpdir(), 'gcli-attach-'));
  const file = join(dir, 'machine.yaml');
  try {
    await writeFile(file, join_.config, { mode: 0o600 });
    const applied = await talosctl(
      ['-n', opts.nodeIp, 'apply-config', '--insecure', '--file', file],
      60_000,
    );
    if (applied.code !== 0) {
      throw new Error(
        `talosctl apply-config failed: ${(applied.stderr || applied.stdout).trim()}`,
      );
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  Logger.info(
    `Config applied - ${opts.name} installs Talos and reboots, then joins "${join_.clusterName}" (pool ${join_.pool}, ${join_.reserved ? 'reserved' : 'extra capacity'}).`,
  );

  if (!opts.wait) {
    Logger.info('Check progress with: gcli cluster:nodes');
    return;
  }
  Logger.info(
    'Waiting for it to join (install + reboot take a few minutes) ...',
  );
  const deadline = Date.now() + opts.timeoutMs;
  while (Date.now() < deadline) {
    await sleep(15_000);
    const nodes = await lastValueFrom(GraphqlClienAPI.clusterNodes(clusterId));
    const node = nodes.find((n) => n.name === opts.name);
    if (node?.status === 'ready') {
      Logger.log(`${opts.name} joined and is ready.`);
      Logger.table([nodeRow(node)]);
      return;
    }
  }
  Logger.warn(
    `${opts.name} has not joined yet. Check gcli cluster:nodes later; if it never joins, reset it (${resetHint(clusterId, opts.name, opts.nodeIp)}) and attach again.`,
  );
};
