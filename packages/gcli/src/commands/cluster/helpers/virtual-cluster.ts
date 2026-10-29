import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';

/** provisionProjectVirtualCluster with the host given by NAME, as in the
    `cluster:` section (`host: prod`) or `cluster:create --host prod`.
    No host = the shared Lambforge cluster. `dedicatedLoadBalancer` =
    `loadBalancer: true` / `--dedicated-lb`. */
export const provisionVirtualCluster = async (
  projectId: string,
  name: string,
  host?: string,
  dedicatedLoadBalancer?: boolean,
) => {
  let hostClusterId: string | undefined;
  if (host) {
    const clusters = await lastValueFrom(
      GraphqlClienAPI.projectClustersDetailed(projectId),
    );
    hostClusterId = clusters.find(
      (c) => c.name === host && c.status !== 'deleted',
    )?.id;
    if (!hostClusterId) {
      throw new Error(
        `No cluster named "${host}" in this project to host the virtual cluster`,
      );
    }
  }
  return lastValueFrom(
    GraphqlClienAPI.provisionProjectVirtualCluster(projectId, {
      name,
      hostClusterId,
      ...(dedicatedLoadBalancer === undefined ? {} : { dedicatedLoadBalancer }),
    }),
  );
};
