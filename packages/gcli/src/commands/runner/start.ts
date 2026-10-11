import { hostname } from 'os';
import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import {
  deriveSubscriptionsUrl,
  forgetRunner,
  readLoginApiUrl,
  readSavedRunner,
  saveRunner,
} from './config';
import { RunnerAuthError, RunnerConnection } from './connection';
import { resolveOllamaUrl } from './ollama';
import { SavedRunner } from './types';

export const RUNNER_VERSION = 'gcli-runner/1';

/**
 * The runner identity to connect with, in order of preference:
 *  1. --token (headless machines: create the runner in the web UI, paste it)
 *  2. the runner saved by a previous `runner:start` on this machine
 *  3. a new runner, registered with the account `gcli login` signed into
 */
const resolveRunner = async (cmd: {
  token?: string;
  name?: string;
  reset?: boolean;
}): Promise<SavedRunner> => {
  if (cmd.token) {
    return { id: '(from --token)', name: cmd.name ?? '', token: cmd.token };
  }
  if (cmd.reset) {
    await forgetRunner();
  }
  const saved = await readSavedRunner();
  if (saved) {
    return saved;
  }
  const name = cmd.name || hostname();
  Logger.info(`Registering this machine as local runner "${name}"...`);
  const { runner, token } = await lastValueFrom(
    GraphqlClienAPI.createLocalRunner(name),
  ).catch((e) => {
    throw new Error(
      `Could not register the runner (${e?.message ?? e}). Run \`gcli login\` first, or pass --token from Profile -> Local AI runners.`,
    );
  });
  const created = { id: runner.id, name: runner.name, token };
  await saveRunner(created);
  return created;
};

export default async (cmd: {
  token?: string;
  name?: string;
  reset?: boolean;
  ollama?: string;
  wsUrl?: string;
}) => {
  const runner = await resolveRunner(cmd);
  const ollamaUrl = resolveOllamaUrl(cmd.ollama);
  const wsUrl =
    cmd.wsUrl ||
    runner.wsUrl ||
    deriveSubscriptionsUrl(await readLoginApiUrl());

  Logger.log('-------------------');
  Logger.log('[Lambforge local AI runner]');
  Logger.info(`Lambforge: ${wsUrl}`);
  Logger.info(`Ollama:    ${ollamaUrl}`);
  Logger.info(
    'Tip: agent mode sends large prompts (instructions + tool list). Give Ollama a big context window, e.g. start it with OLLAMA_CONTEXT_LENGTH=32768.',
  );
  Logger.log('-------------------');

  const connection = new RunnerConnection({
    wsUrl,
    token: runner.token,
    ollamaUrl,
    version: RUNNER_VERSION,
    logger: Logger,
  });

  const shutdown = () => {
    Logger.info('Stopping runner...');
    connection.stop();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  try {
    await connection.run();
  } catch (e) {
    if (e instanceof RunnerAuthError) {
      Logger.error(e.message);
      process.exit(1);
    }
    throw e;
  }
};
