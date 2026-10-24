import { chmod, mkdir, readFile, writeFile } from 'fs/promises';

import { mainDirectory, workspacesDirectory } from '~/types';

import { SavedWorkspace } from './types';

/** Every workspace registered on this machine, keyed by its root directory. */
export const readSavedWorkspaces = async (): Promise<
  Record<string, SavedWorkspace>
> => {
  try {
    const saved = JSON.parse(await readFile(workspacesDirectory, 'utf-8'));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
};

const writeAll = async (all: Record<string, SavedWorkspace>) => {
  await mkdir(mainDirectory, { recursive: true });
  await writeFile(workspacesDirectory, JSON.stringify(all, null, 2), 'utf-8');
  // A workspace token lets its holder run commands for this account's chat.
  await chmod(workspacesDirectory, 0o600);
};

export const readSavedWorkspace = async (root: string) => {
  const saved = (await readSavedWorkspaces())[root];
  return saved?.id && saved?.token ? saved : null;
};

export const saveWorkspace = async (workspace: SavedWorkspace) => {
  const all = await readSavedWorkspaces();
  all[workspace.root] = workspace;
  await writeAll(all);
};

/** Forgets one workspace (by root or id); returns what was removed. */
export const forgetWorkspace = async (match: {
  root?: string;
  id?: string;
}) => {
  const all = await readSavedWorkspaces();
  const removed: SavedWorkspace[] = [];
  for (const [root, w] of Object.entries(all)) {
    if (
      (match.root && root === match.root) ||
      (match.id && w.id === match.id)
    ) {
      removed.push(w);
      delete all[root];
    }
  }
  if (removed.length) {
    await writeAll(all);
  }
  return removed;
};
