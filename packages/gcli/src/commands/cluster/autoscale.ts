import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import {
  ClusterTargetOptions,
  parseIntOption,
  resolveClusterTarget,
} from './helpers/cluster-change';
import { ClusterAutoscalePolicy } from './types';

export interface AutoscaleOptions extends ClusterTargetOptions {
  enable?: boolean;
  disable?: boolean;
  min?: string;
  max?: string;
  cpuUp?: string;
  memUp?: string;
  cpuDown?: string;
  memDown?: string;
  samples?: string;
  cooldown?: string;
}

/** Only the flags given - the server merges them into the stored policy
    (and validates: min <= max, scale-down below scale-up, ...). */
export const toAutoscaleInput = (
  cmd: AutoscaleOptions,
): ClusterAutoscalePolicy => {
  if (cmd.enable && cmd.disable) {
    throw new Error('Pass --enable or --disable, not both');
  }
  const input: ClusterAutoscalePolicy = {};
  if (cmd.enable) input.enabled = true;
  if (cmd.disable) input.enabled = false;
  const ints: [
    keyof AutoscaleOptions,
    keyof ClusterAutoscalePolicy,
    number,
    number,
  ][] = [
    ['min', 'minWorkers', 1, 10],
    ['max', 'maxWorkers', 1, 10],
    ['cpuUp', 'cpuScaleUpPercent', 1, 100],
    ['memUp', 'memScaleUpPercent', 1, 100],
    ['cpuDown', 'cpuScaleDownPercent', 1, 100],
    ['memDown', 'memScaleDownPercent', 1, 100],
    ['samples', 'samplesToScale', 1, 20],
    ['cooldown', 'cooldownMinutes', 1, 1440],
  ];
  for (const [flag, field, min, max] of ints) {
    if (cmd[flag] !== undefined) {
      (input as Record<string, unknown>)[field] = parseIntOption(
        String(flag),
        cmd[flag],
        min,
        max,
      );
    }
  }
  if (!Object.keys(input).length) {
    throw new Error(
      'Nothing to change: pass --enable/--disable and/or --min, --max, --cpuUp, --memUp, --cpuDown, --memDown, --samples, --cooldown (gcli cluster:status shows the current policy)',
    );
  }
  return input;
};

/** gcli cluster:autoscale --cluster <id> [--enable|--disable] [--min n] ... */
export default async (cmd: AutoscaleOptions) => {
  const input = toAutoscaleInput(cmd);
  const { projectId, clusterId } = await resolveClusterTarget(cmd);
  const cluster = await lastValueFrom(
    GraphqlClienAPI.updateProjectClusterAutoscale(projectId, clusterId, input),
  );
  const a = cluster.autoscale ?? {};
  Logger.log('-------------------');
  Logger.log('[Action][updateProjectClusterAutoscale]');
  Logger.table([
    {
      cluster: cluster.name,
      workers: cluster.topology?.workers,
      enabled: a.enabled,
      minWorkers: a.minWorkers,
      maxWorkers: a.maxWorkers,
      scaleUpAt: `cpu ${a.cpuScaleUpPercent}% / mem ${a.memScaleUpPercent}%`,
      scaleDownAt: `cpu ${a.cpuScaleDownPercent}% / mem ${a.memScaleDownPercent}%`,
      samples: a.samplesToScale,
      cooldownMin: a.cooldownMinutes,
    },
  ]);
  Logger.log('-------------------');
  return cluster;
};
