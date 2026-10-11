import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { forgetRunner, readSavedRunner } from './config';

export default async (cmd: { id?: string }) => {
  const saved = await readSavedRunner();
  const runnerId = cmd.id || saved?.id;
  if (!runnerId) {
    throw new Error('Specify the runner with --id (see `gcli runner:list`).');
  }
  await lastValueFrom(GraphqlClienAPI.deleteLocalRunner(runnerId));
  if (saved?.id === runnerId) {
    await forgetRunner();
  }
  Logger.log(`Local runner ${runnerId} deleted; its token no longer works.`);
};
