import { chmod, mkdir, readFile, rm, writeFile } from 'fs/promises';

import { mainDirectory, runnerDirectory, urlDirectory } from '~/types';

import { SavedRunner } from './types';

const DEFAULT_WS_URL = 'wss://api.lambforge.com/subscriptions';

/**
 * The runner talks to the subscriptions endpoint, not the gateway `gcli login`
 * stores. Production serves both from one host; local development runs the
 * gateway on :9004 and the subscriptions server on :9000.
 */
export const deriveSubscriptionsUrl = (apiUrl?: string) => {
  if (!apiUrl?.trim()) {
    return DEFAULT_WS_URL;
  }
  const url = new URL(apiUrl.trim());
  if (
    ['localhost', '127.0.0.1'].includes(url.hostname) &&
    url.port === '9004'
  ) {
    return `ws://${url.hostname}:9000/subscriptions`;
  }
  url.protocol = url.protocol === 'http:' ? 'ws:' : 'wss:';
  url.pathname = '/subscriptions';
  url.search = '';
  return url.toString();
};

export const readLoginApiUrl = () =>
  readFile(urlDirectory, 'utf-8').catch(() => '');

export const readSavedRunner = async (): Promise<SavedRunner | null> => {
  try {
    const saved = JSON.parse(await readFile(runnerDirectory, 'utf-8'));
    return saved?.id && saved?.token ? saved : null;
  } catch {
    return null;
  }
};

export const saveRunner = async (runner: SavedRunner) => {
  await mkdir(mainDirectory, { recursive: true });
  await writeFile(runnerDirectory, JSON.stringify(runner, null, 2), 'utf-8');
  // The runner token lets its holder serve this account's chat requests.
  await chmod(runnerDirectory, 0o600);
};

export const forgetRunner = () => rm(runnerDirectory, { force: true });
