import { writeFile } from 'fs/promises';
import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import {
  ClusterTargetOptions,
  resolveClusterTarget,
} from './helpers/cluster-change';

/**
 * gcli cluster:talosconfig - a short-lived talosconfig for one of your Talos
 * clusters (OS-level admin of its machines; talosctl -n <ip> ...). Freshly
 * signed for --ttl minutes (default 60, max 1440), so a lost copy stops
 * working by itself. Written to -o <file> with mode 600, or printed.
 */
export default async (
  cmd: ClusterTargetOptions & { output?: string; ttl?: string },
) => {
  const ttl = cmd.ttl === undefined ? undefined : Number(cmd.ttl);
  if (ttl !== undefined && (!Number.isInteger(ttl) || ttl < 5 || ttl > 1440)) {
    throw new Error('--ttl is in minutes, 5 to 1440');
  }
  const { clusterId } = await resolveClusterTarget(cmd);
  const res = await lastValueFrom(
    GraphqlClienAPI.clusterTalosconfig(clusterId, ttl),
  );
  if (!cmd.output) {
    process.stdout.write(res.talosconfig);
    return;
  }
  await writeFile(cmd.output, res.talosconfig, { mode: 0o600 });
  Logger.log(
    `Wrote talosconfig to ${cmd.output} (valid until ${res.expiresAt}).`,
  );
  Logger.info(
    `Use it with: talosctl --talosconfig ${cmd.output} -n <node-ip> <command>  (Talos ${res.talosVersion ?? ''})`,
  );
};
