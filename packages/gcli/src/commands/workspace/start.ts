import { realpath } from 'fs/promises';
import { basename } from 'path';
import { lastValueFrom } from 'rxjs';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { deriveSubscriptionsUrl, readLoginApiUrl } from '../runner/config';
import { RUNNER_AUTH_EXIT_CODE } from '../runner/daemon';
import { RunnerAuthError } from '../runner/tunnel';
import { TerminalPrompt } from './approvals';
import { forgetWorkspace, readSavedWorkspace, saveWorkspace } from './config';
import { WorkspaceConnection } from './connection';
import { CommandPolicy } from './policy';
import { SavedWorkspace } from './types';

export const WORKSPACE_VERSION = 'gcli-workspace/1';

const csv = (value?: string) =>
  (value ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

export interface WorkspaceStartOptions {
  name?: string;
  project?: string;
  token?: string;
  reset?: boolean;
  allow?: string;
  yolo?: boolean;
  defaultAllow?: boolean;
  allowSecrets?: boolean;
  env?: string;
  inheritEnv?: boolean;
  terminalApproval?: boolean;
  wsUrl?: string;
}

/**
 * The workspace identity for this directory, in order of preference:
 *  1. --token (a workspace created elsewhere; --project is then required)
 *  2. the workspace saved by a previous `workspace:start` in this directory
 *  3. a new one, registered with the `gcli login` account in the project of
 *     --project / `gcli project:use`
 */
const resolveWorkspace = async (
  root: string,
  cmd: WorkspaceStartOptions,
): Promise<SavedWorkspace> => {
  if (cmd.token) {
    return {
      id: '(from --token)',
      name: cmd.name ?? basename(root),
      token: cmd.token,
      projectId: cmd.project ?? '',
      root,
    };
  }
  if (cmd.reset) {
    await forgetWorkspace({ root });
  }
  const saved = await readSavedWorkspace(root);
  if (saved && (!cmd.project || cmd.project === saved.projectId)) {
    return saved;
  }
  const projectId = await lastValueFrom(parseProjectId(cmd.project)).catch(
    () => {
      throw new Error(
        'No project selected. Pass --project <projectId> or run `gcli project:use <projectId>` first.',
      );
    },
  );
  const name = cmd.name || basename(root);
  Logger.info(`Registering ${root} as local workspace "${name}"...`);
  const { workspace, token } = await lastValueFrom(
    GraphqlClienAPI.createLocalWorkspace(projectId, name),
  ).catch((e) => {
    throw new Error(
      `Could not register the workspace (${e?.message ?? e}). Run \`gcli login\` first.`,
    );
  });
  const created: SavedWorkspace = {
    id: workspace.id,
    name: workspace.name,
    token,
    projectId,
    root,
  };
  await saveWorkspace(created);
  return created;
};

export default async (cmd: WorkspaceStartOptions) => {
  const root = await realpath(process.cwd());
  const workspace = await resolveWorkspace(root, cmd);
  const wsUrl =
    cmd.wsUrl ||
    workspace.wsUrl ||
    deriveSubscriptionsUrl(await readLoginApiUrl());
  const policy = new CommandPolicy(
    cmd.yolo ? 'yolo' : 'ask',
    csv(cmd.allow),
    cmd.defaultAllow !== false,
  );
  const terminal =
    cmd.terminalApproval !== false && !!process.stdin.isTTY
      ? new TerminalPrompt()
      : null;

  Logger.log('-------------------');
  Logger.log('[Lambforge local workspace]');
  Logger.info(`Directory: ${root}`);
  Logger.info(`Project:   ${workspace.projectId}`);
  Logger.info(`Lambforge: ${wsUrl}`);
  if (policy.mode === 'yolo') {
    Logger.warn(
      '\x1b[31m--yolo: the chat agents can run ANY command on this machine without asking.\x1b[0m',
    );
  } else {
    Logger.info(
      `Commands:  ask for approval ${terminal ? 'here and in the chat' : 'in the chat'}, except: ${policy.allowRules.join(', ') || '(nothing)'}`,
    );
  }
  Logger.info(
    `Env:       ${cmd.inheritEnv ? 'your full shell environment' : `a minimal environment${cmd.env ? ` + ${cmd.env}` : ''} (--inherit-env for all of it)`}`,
  );
  if (cmd.allowSecrets) {
    Logger.warn(
      '--allow-secrets: .env files and keys are readable by the chat.',
    );
  }
  Logger.info(
    'Press Ctrl+C to disconnect (stops every process the chat started).',
  );
  Logger.log('-------------------');

  const connection = new WorkspaceConnection({
    wsUrl,
    token: workspace.token,
    root,
    version: WORKSPACE_VERSION,
    logger: Logger,
    policy,
    allowSecrets: cmd.allowSecrets,
    inheritEnv: cmd.inheritEnv,
    passEnv: csv(cmd.env),
    prompt: terminal,
  });

  const shutdown = () => {
    Logger.info('Disconnecting the workspace...');
    connection.stop();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  // Last resort: never leave a dev server the chat started running.
  process.once('exit', () => connection.processes.stopAll());

  try {
    await connection.run();
  } catch (e) {
    if (e instanceof RunnerAuthError) {
      Logger.error(e.message);
      process.exit(RUNNER_AUTH_EXIT_CODE);
    }
    throw e;
  }
  // stdin (approval prompts) would keep the process alive otherwise
  process.exit(0);
};
