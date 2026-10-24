import { realpath } from 'fs/promises';
import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { forgetWorkspace, readSavedWorkspace } from './config';

export default async (cmd: { id?: string }) => {
  const root = await realpath(process.cwd());
  const workspaceId = cmd.id || (await readSavedWorkspace(root))?.id;
  if (!workspaceId) {
    throw new Error(
      'No workspace registered for this directory - pass --id (see `gcli workspace:list`).',
    );
  }
  await lastValueFrom(GraphqlClienAPI.deleteLocalWorkspace(workspaceId));
  await forgetWorkspace({ id: workspaceId });
  Logger.log(
    `Local workspace ${workspaceId} deleted; its token no longer works.`,
  );
};
