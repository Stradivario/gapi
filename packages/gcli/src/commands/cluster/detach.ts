import { createInterface } from 'readline';
import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { resetHint } from './helpers/attach';
import {
  ClusterTargetOptions,
  resolveClusterTarget,
} from './helpers/cluster-change';

/** gcli cluster:detach --name <machine> - drain + remove an attached machine
    from the cluster. The machine keeps Talos: reset it from its network. */
export default async (
  cmd: ClusterTargetOptions & { name?: string; yes?: boolean },
) => {
  const name = (cmd.name ?? '').trim();
  if (!name) {
    throw new Error('--name is required (see gcli cluster:nodes)');
  }
  const { clusterId } = await resolveClusterTarget(cmd);
  if (!cmd.yes) {
    const answer = await new Promise<string>((resolve) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(
        `Drain and remove ${name} from the cluster? Its pods move to other nodes. [y/N] `,
        (a) => {
          rl.close();
          resolve(a.trim().toLowerCase());
        },
      );
    });
    if (answer !== 'y' && answer !== 'yes') {
      Logger.warn('Cancelled - nothing was changed.');
      return;
    }
  }
  const node = await lastValueFrom(
    GraphqlClienAPI.detachClusterNode(clusterId, name),
  );
  Logger.log(`${node.name} is detached.`);
  Logger.info(
    `The machine still runs Talos. To reuse it, reset it from its network: ${resetHint()}`,
  );
};
