import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import {
  ClusterTargetOptions,
  resolveClusterTarget,
} from './helpers/cluster-change';

type PauseOptions = ClusterTargetOptions & { name?: string };

/** cluster:pause / cluster:resume --name <machine> - cordon / uncordon an
    attached machine: paused, nothing new is scheduled there and running work
    stays. Hetzner nodes are refused server-side (they change by scaling). */
const setPaused = (paused: boolean) => async (cmd: PauseOptions) => {
  const name = (cmd.name ?? '').trim();
  if (!name) {
    throw new Error('--name is required (see gcli cluster:nodes)');
  }
  const { clusterId } = await resolveClusterTarget(cmd);
  const node = await lastValueFrom(
    GraphqlClienAPI.setClusterNodePaused(clusterId, name, paused),
  );
  Logger.log(
    paused
      ? `${node.name} is paused: nothing new runs there, running work stays. Undo with gcli cluster:resume.`
      : `${node.name} takes new work again.`,
  );
};

export const pause = setPaused(true);
export const resume = setPaused(false);
