import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { readSavedWorkspaces } from './config';

export default async (cmd: { project?: string }) => {
  const [workspaces, saved] = await Promise.all([
    lastValueFrom(GraphqlClienAPI.listLocalWorkspaces(cmd.project)),
    readSavedWorkspaces(),
  ]);
  const onThisMachine = new Set(Object.values(saved).map((w) => w.id));
  Logger.log('-------------------');
  Logger.log('[Action][listLocalWorkspaces]');
  if (!workspaces?.length) {
    Logger.info(
      'No local workspaces yet. Run `gcli workspace:start` in a project directory.',
    );
  } else {
    Logger.table(
      workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        online: w.online,
        project: w.projectId,
        root: w.root,
        host: w.hostname,
        thisMachine: onThisMachine.has(w.id),
        processes: (w.processes ?? [])
          .filter((p) => p.status === 'running')
          .map((p) => p.name || p.command)
          .join(', '),
      })),
    );
  }
  Logger.log('-------------------');
};
