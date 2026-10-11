import { lastValueFrom } from 'rxjs';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { readSavedRunner } from './config';
import { LocalRunner } from './types';

const isShown = (runner: LocalRunner, name: string) =>
  !Array.isArray(runner.enabledModels) || runner.enabledModels.includes(name);

/** `--show a,b` / `--all` / `--none` -> the selection to save; no flag -> null (just list). */
export const parseSelection = (cmd: {
  show?: string;
  all?: boolean;
  none?: boolean;
}): { models: string[] | null } | null => {
  if (
    [cmd.show !== undefined, !!cmd.all, !!cmd.none].filter(Boolean).length > 1
  ) {
    throw new Error('Use only one of --show, --all, --none.');
  }
  if (cmd.all) {
    return { models: null };
  }
  if (cmd.none) {
    return { models: [] };
  }
  if (cmd.show !== undefined) {
    return {
      models: cmd.show
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
    };
  }
  return null;
};

export default async (cmd: {
  id?: string;
  show?: string;
  all?: boolean;
  none?: boolean;
}) => {
  const selection = parseSelection(cmd);
  const runnerId = cmd.id || (await readSavedRunner())?.id;
  if (!runnerId) {
    throw new Error('Specify the runner with --id (see `gcli runner:list`).');
  }

  let runner: LocalRunner;
  if (selection) {
    runner = await lastValueFrom(
      GraphqlClienAPI.setLocalRunnerModels(runnerId, selection.models),
    );
  } else {
    const runners = await lastValueFrom(GraphqlClienAPI.listLocalRunners());
    runner = runners.find((r) => r.id === runnerId);
  }
  if (!runner) {
    throw new Error(`Runner ${runnerId} not found.`);
  }

  const models = runner.models ?? [];
  const unknown = (selection?.models ?? []).filter(
    (m) => !models.some((x) => x.name === m),
  );
  if (unknown.length) {
    Logger.warn(
      `Not reported by this runner (kept anyway, shown once Ollama has them): ${unknown.join(', ')}`,
    );
  }
  Logger.log(
    `[${runner.name}] shown in chat: ${models.filter((m) => isShown(runner, m.name)).length} of ${models.length}`,
  );
  Logger.table(
    models.map((m) => ({
      model: m.name,
      shown: isShown(runner, m.name),
      size: m.parameterSize,
      tools: m.capabilities?.includes('tools'),
    })),
  );
};
