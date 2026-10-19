import { GraphqlClienAPI } from '~/services/gql-client';

import {
  ClusterTargetOptions,
  resolveClusterTarget,
  runClusterChange,
} from './helpers/cluster-change';

/** gcli cluster:load-balancer --cluster <id> --enable|--disable [--wait] */
export default async (
  cmd: ClusterTargetOptions & {
    enable?: boolean;
    disable?: boolean;
    wait?: boolean;
  },
) => {
  if (!!cmd.enable === !!cmd.disable) {
    throw new Error('Pass exactly one of --enable or --disable');
  }
  const { projectId, clusterId } = await resolveClusterTarget(cmd);
  return runClusterChange(
    cmd.enable
      ? 'enableLoadBalancerProjectCluster'
      : 'disableLoadBalancerProjectCluster',
    projectId,
    GraphqlClienAPI.setProjectClusterLoadBalancer(
      projectId,
      clusterId,
      !!cmd.enable,
    ),
    cmd.wait,
  );
};
