import { from, lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { CostAPI } from '~/services/cost-optimization';
import { ui } from '~/services/ui';

import {
  ClusterTargetOptions,
  resolveClusterTarget,
} from '../cluster/helpers/cluster-change';

export const PLACEMENTS = ['spread', 'fill'] as const;

/** gcli cluster:pod-placement --cluster <id> --mode spread|fill */
export default (cmd: ClusterTargetOptions & { mode?: string }) => {
  if (!PLACEMENTS.includes(cmd.mode as never)) {
    throw new Error(
      `--mode must be spread (new pods on the emptiest machine) or fill (pack machines, so the autoscaler can remove empty ones), got "${cmd.mode ?? ''}"`,
    );
  }
  return lastValueFrom(
    from(resolveClusterTarget(cmd)).pipe(
      switchMap(({ projectId, clusterId }) =>
        CostAPI.setPodPlacement(
          projectId,
          clusterId,
          cmd.mode as 'spread' | 'fill',
        ),
      ),
      tap((c) => {
        ui.table([
          {
            cluster: c.name,
            status: c.status,
            podPlacement: c.podPlacement,
            job: c.podPlacementJob ?? '',
            error: c.podPlacementError ?? '',
          },
        ]);
        ui.info(
          'Applied on the control planes in the background (no reboot); running pods stay where they are. gcli cluster:status shows it.',
          'cluster',
        );
      }),
    ),
  );
};
