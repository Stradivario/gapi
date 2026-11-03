import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import {
  ClusterTargetOptions,
  resolveClusterTarget,
} from './helpers/cluster-change';

/** gcli cluster:plan --cluster <id> - why pods are pending and what the
    pods-mode autoscaler would do now (plan 17). Read-only. */
export default async (cmd: ClusterTargetOptions) => {
  const { projectId, clusterId } = await resolveClusterTarget(cmd);
  const plan = await lastValueFrom(
    GraphqlClienAPI.clusterProvisioningPlan(projectId, clusterId),
  );
  Logger.log('-------------------');
  Logger.log('[Action][clusterProvisioningPlan]');
  Logger.info(
    `mode ${plan.mode}${plan.enabled ? '' : ' (autoscaling off)'}, heartbeat ${plan.sampleAt ?? 'none'}`,
  );
  if (plan.agentReportsPods === false) {
    Logger.warn(
      'The cluster agent is too old to report pending pods - reinstall it from the Agent card on the dashboard (Install agent) or with the MCP tool InstallClusterAgent.',
    );
  }
  if (plan.note) Logger.info(plan.note);
  if (plan.verdicts?.length) {
    Logger.table(
      plan.verdicts.map((v) => ({
        pod: v.pod,
        status: v.status,
        reason: v.reason ?? '',
      })),
    );
  } else if (!plan.note) {
    Logger.info('Every pod is scheduled.');
  }
  if (plan.claims?.length) {
    Logger.info(
      `${plan.mode === 'pods' && plan.enabled ? 'Creating' : 'Pods mode would create'}: ${plan.claims
        .map((c) => `${c.type} (${c.pool}) for ${c.pods?.length ?? 0} pod(s)`)
        .join(', ')} - +${plan.addedMonthly}/month`,
    );
  }
  if (plan.consolidation && plan.consolidation.action !== 'keep') {
    Logger.info(
      `Consolidation: ${plan.consolidation.action} ${plan.consolidation.node} - ${plan.consolidation.reason}`,
    );
  }
  Logger.log('-------------------');
  return plan;
};
