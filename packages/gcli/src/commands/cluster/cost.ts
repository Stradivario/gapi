import { lastValueFrom } from 'rxjs';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

const money = (v?: number | null, sign = '€') =>
  v == null ? '-' : `${sign}${v.toFixed(2)}`;

/** gcli cluster:cost - month-to-date cost and the monthly estimate of every
    private cluster (projectClustersOverview). */
export default async (cmd: { project?: string }) => {
  const projectId = await lastValueFrom(parseProjectId(cmd.project));
  const rows = await lastValueFrom(
    GraphqlClienAPI.projectClustersOverview(projectId),
  );
  Logger.log('-------------------');
  Logger.log('[Action][clusterCost]');
  if (!rows.length) {
    Logger.info('No private clusters for this project.');
  } else {
    Logger.table(
      rows.map((c) => ({
        name: c.name,
        status: c.status,
        period: c.monthToDate?.period ?? '-',
        nodeHours: c.monthToDate?.nodeHours ?? 0,
        loadBalancerHours: c.monthToDate?.loadBalancerHours ?? 0,
        monthToDateEur: money(c.monthToDate?.totalCostEur),
        monthToDateUsd: money(c.monthToDate?.totalCostUsd, '$'),
        estimatedMonthEur: money(c.estimatedMonthlyCostEur),
      })),
    );
  }
  Logger.log('-------------------');
  return rows;
};
