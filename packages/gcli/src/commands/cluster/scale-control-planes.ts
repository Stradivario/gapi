import { GraphqlClienAPI } from '~/services/gql-client';

import {
  ClusterTargetOptions,
  resolveClusterTarget,
  runClusterChange,
} from './helpers/cluster-change';

/** gcli cluster:scale:control-planes --cluster <id> --count <1|3|5> [--wait] */
export default async (
  cmd: ClusterTargetOptions & { count?: string; wait?: boolean },
) => {
  const count = Number(cmd.count);
  if (![1, 3, 5].includes(count)) {
    throw new Error(
      '--count must be 1, 3 or 5 (an odd number keeps etcd quorum)',
    );
  }
  const { projectId, clusterId } = await resolveClusterTarget(cmd);
  return runClusterChange(
    'scaleControlPlanesProjectCluster',
    projectId,
    GraphqlClienAPI.scaleControlPlanesProjectCluster(
      projectId,
      clusterId,
      count,
    ),
    cmd.wait,
  );
};
