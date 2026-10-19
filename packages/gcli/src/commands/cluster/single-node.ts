import { GraphqlClienAPI } from '~/services/gql-client';

import {
  ClusterTargetOptions,
  resolveClusterTarget,
  runClusterChange,
} from './helpers/cluster-change';

/** gcli cluster:single-node --cluster <id> [--wait]
    Multi-node -> single node (removes the worker nodes). */
export default async (cmd: ClusterTargetOptions & { wait?: boolean }) => {
  const { projectId, clusterId } = await resolveClusterTarget(cmd);
  return runClusterChange(
    'revertToSingleNodeProjectCluster',
    projectId,
    GraphqlClienAPI.revertToSingleNodeProjectCluster(projectId, clusterId),
    cmd.wait,
  );
};
