import { lastValueFrom } from 'rxjs';

import { parseProjectId, resolveClusterId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';
import { humanOutputToStderr, ui } from '~/services/ui';

import { ClusterTargetOptions } from './helpers/cluster-change';
import { statusView } from './helpers/health-view';
import { ClusterOverview } from './types';

const pct = (v?: number) => (v == null ? '-' : `${Math.round(v)}%`);

export const overviewRow = (c: ClusterOverview) => ({
  name: c.name,
  id: c.clusterId,
  status: c.status,
  overall: c.overall,
  agent: c.agentOnline ? 'online' : 'offline',
  nodes: c.health
    ? `${c.health.nodesReady ?? 0}/${c.health.nodesTotal ?? 0} ready`
    : '-',
  pods: c.health
    ? `${c.health.pods ?? 0} (${c.health.pendingPods ?? 0} pending)`
    : '-',
  cpu: c.health
    ? `${pct(c.health.cpuUsagePercent)} used / ${pct(c.health.cpuRequestsPercent)} req`
    : '-',
  mem: c.health
    ? `${pct(c.health.memUsagePercent)} used / ${pct(c.health.memRequestsPercent)} req`
    : '-',
  autoscale: c.autoscale?.enabled
    ? `on ${c.autoscale.minWorkers}-${c.autoscale.maxWorkers}`
    : 'off',
});

/** gcli cluster:status [--cluster <id>] - every cluster's health, agent,
    load, autoscale and open issues (projectClustersOverview). */
export default async (cmd: ClusterTargetOptions & { json?: boolean }) => {
  if (cmd.json) humanOutputToStderr();
  const projectId = await lastValueFrom(parseProjectId(cmd.project));
  const clusterId = await lastValueFrom(
    resolveClusterId(projectId, {
      clusterId: cmd.cluster,
      clusterName: cmd.clusterName,
    }),
  );
  const all = await lastValueFrom(
    GraphqlClienAPI.projectClustersOverview(projectId),
  );
  const rows = clusterId ? all.filter((c) => c.clusterId === clusterId) : all;
  if (!rows.length) {
    Logger.info(
      clusterId
        ? `No cluster ${clusterId} in this project.`
        : 'No private clusters for this project - it runs on the shared cluster. See cluster:create.',
    );
  } else if (cmd.json) {
    process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
  } else {
    ui.print(['', ...statusView(rows, new Date()), ''].join('\n'));
  }
  return rows;
};
