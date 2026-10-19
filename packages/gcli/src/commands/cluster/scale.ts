import { GraphqlClienAPI } from '~/services/gql-client';

import {
  ClusterTargetOptions,
  parseIntOption,
  resolveClusterTarget,
  runClusterChange,
} from './helpers/cluster-change';

/** gcli cluster:scale --cluster <id> --workers <1-10> [--wait] */
export default async (
  cmd: ClusterTargetOptions & { workers?: string; wait?: boolean },
) => {
  const workers = parseIntOption('workers', cmd.workers, 1, 10);
  const { projectId, clusterId } = await resolveClusterTarget(cmd);
  return runClusterChange(
    'scaleProjectCluster',
    projectId,
    GraphqlClienAPI.scaleProjectCluster(projectId, clusterId, workers),
    cmd.wait,
  );
};
