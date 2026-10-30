import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { nodeRow } from './helpers/attach';
import {
  ClusterTargetOptions,
  resolveClusterTarget,
} from './helpers/cluster-change';

/** gcli cluster:nodes - every node of a cluster: its Hetzner control planes
    and workers and the machines attached to it (same list as the
    dashboard's Nodes card). */
export default async (cmd: ClusterTargetOptions) => {
  const { clusterId } = await resolveClusterTarget(cmd);
  const nodes = await lastValueFrom(
    GraphqlClienAPI.clusterNodes(clusterId, true),
  );
  if (!nodes.length) {
    Logger.info('No nodes reported for this cluster yet.');
    return;
  }
  Logger.table(nodes.map(nodeRow));
  if (!nodes.some((n) => n.source !== 'hetzner')) {
    Logger.info(
      'No machines of your own attached. Attach one with: gcli cluster:attach --cluster <id> --node-ip <ip> --name <name> --disk <disk>',
    );
  }
};
