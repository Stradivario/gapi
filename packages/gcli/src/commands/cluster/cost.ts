import { lastValueFrom } from 'rxjs';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

/** Amounts are in the platform currency (billingCatalog.currency). */
const money = (v?: number | null) => (v == null ? '-' : v.toFixed(2));

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
    Logger.info('Amounts in the platform currency (EUR unless changed).');
    Logger.table(
      rows.map((c) => ({
        name: c.name,
        status: c.status,
        period: c.monthToDate?.period ?? '-',
        nodeHours: c.monthToDate?.nodeHours ?? 0,
        loadBalancerHours: c.monthToDate?.loadBalancerHours ?? 0,
        monthToDate: money(c.monthToDate?.totalCost),
        estimatedMonth: money(c.estimatedMonthlyCost),
      })),
    );
  }
  Logger.log('-------------------');
  return rows;
};
