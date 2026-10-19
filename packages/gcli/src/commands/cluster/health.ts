import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import {
  ClusterTargetOptions,
  resolveClusterTarget,
} from './helpers/cluster-change';

const pct = (v?: number) => (v == null ? '-' : `${Math.round(v)}%`);

/** gcli cluster:health --cluster <id> - the latest health snapshot the
    lambforge-agent reported, with every node. */
export default async (cmd: ClusterTargetOptions) => {
  const { projectId, clusterId } = await resolveClusterTarget(cmd);
  const [latest] = await lastValueFrom(
    GraphqlClienAPI.clusterHealth(projectId, clusterId, 1),
  );
  Logger.log('-------------------');
  Logger.log('[Action][clusterHealth]');
  if (!latest) {
    Logger.info(
      'No health reports yet - the cluster agent has not reported (it installs with the cluster; check cluster:status for "agent").',
    );
  } else {
    Logger.table([
      {
        reportedAt: latest.createdAt,
        kubernetes: latest.kubernetesVersion,
        agent: latest.agentVersion,
        pods: latest.pods,
        pendingPods: latest.pendingPods,
        fission: latest.fissionReady ? 'ready' : 'not ready',
        prometheus: latest.prometheusReady ? 'ready' : 'not ready',
        cpu: `${pct(latest.cpuUsagePercent)} used / ${pct(latest.cpuRequestsPercent)} req`,
        mem: `${pct(latest.memUsagePercent)} used / ${pct(latest.memRequestsPercent)} req`,
      },
    ]);
    if (latest.nodes?.length) {
      Logger.table(
        latest.nodes.map((n) => ({
          node: n.name,
          role: n.role,
          ready: n.ready,
          type: n.instanceType,
          pods: n.podCount,
          cordoned: n.cordoned ?? false,
        })),
      );
    }
  }
  Logger.log('-------------------');
  return latest ?? null;
};
