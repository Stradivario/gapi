import { GraphqlClienAPI } from '~/services/gql-client';

import {
  ClusterTargetOptions,
  parseIntOption,
  resolveClusterTarget,
  runClusterChange,
} from './helpers/cluster-change';

/** gcli cluster:multi-node --cluster <id> --workers <1-10> [--wait]
    Single-node -> dedicated worker nodes (needed before autoscaling). */
export default async (
  cmd: ClusterTargetOptions & { workers?: string; wait?: boolean },
) => {
  const workers = parseIntOption('workers', cmd.workers, 1, 10);
  const { projectId, clusterId } = await resolveClusterTarget(cmd);
  return runClusterChange(
    'migrateToMultiNodeProjectCluster',
    projectId,
    GraphqlClienAPI.migrateToMultiNodeProjectCluster(
      projectId,
      clusterId,
      workers,
    ),
    cmd.wait,
  );
};
