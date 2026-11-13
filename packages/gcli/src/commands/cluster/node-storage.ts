import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import {
  ClusterTargetOptions,
  resolveClusterTarget,
} from './helpers/cluster-change';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Follows a machine until its storage is ready (or failed), printing every
 * new step. The work happens on the platform: closing gcli does not stop it.
 */
export async function waitForStorage(
  clusterId: string,
  name: string,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  while (Date.now() < deadline) {
    const nodes = await lastValueFrom(GraphqlClienAPI.clusterNodes(clusterId));
    const node = nodes.find((n) => n.name === name);
    if (node?.storage === 'ready') {
      Logger.log(`${name} carries volumes now.`);
      return true;
    }
    if (node?.storage === 'failed') {
      throw new Error(
        `Storage on ${name} failed: ${node.storageMessage ?? 'no reason given'}. Fix it and run the command again.`,
      );
    }
    const step = node?.storageMessage ?? node?.storage ?? '';
    if (step && step !== last) {
      Logger.info(`${name}: ${step}`);
      last = step;
    }
    await sleep(10_000);
  }
  Logger.warn(
    `${name} is still being prepared - it continues on the platform. Check with: gcli cluster:nodes`,
  );
  return false;
}

/**
 * gcli cluster:node-storage --name <machine> [--off] [--no-wait]
 *
 * Lets an attached machine carry volumes on its own disk (or stops it).
 * On: the platform installs Talos with the storage extensions on it - the
 * machine restarts once, its workloads move away first - and the cluster
 * gets the storage add-on. Needs no access to the machine from here.
 */
export default async (
  cmd: ClusterTargetOptions & {
    name?: string;
    off?: boolean;
    wait?: boolean;
    timeout?: string;
  },
) => {
  const name = (cmd.name ?? '').trim();
  if (!name) {
    throw new Error('--name is required (see gcli cluster:nodes)');
  }
  const minutes = cmd.timeout === undefined ? 40 : Number(cmd.timeout);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 120) {
    throw new Error('--timeout is in minutes, 1 to 120');
  }
  const { clusterId } = await resolveClusterTarget(cmd);
  const node = await lastValueFrom(
    GraphqlClienAPI.setClusterNodeStorage(clusterId, name, !cmd.off),
  );
  if (cmd.off) {
    Logger.log(`${node.name} no longer carries volumes.`);
    return;
  }
  if (node.storage === 'ready') {
    Logger.log(`${node.name} already carries volumes.`);
    return;
  }
  Logger.info(
    `Preparing ${node.name}: it may restart once (a few minutes); its workloads move to other nodes first.`,
  );
  if (cmd.wait === false) {
    Logger.info('Check progress with: gcli cluster:nodes');
    return;
  }
  await waitForStorage(clusterId, name, minutes * 60_000);
};
