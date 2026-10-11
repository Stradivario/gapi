import { spawn } from 'child_process';

import { Logger } from '~/services/log';

import { forgetRunner, readSavedRunner, saveRunner } from './config';
import {
  assertSystemdAvailable,
  buildUnit,
  DEFAULT_SERVICE_NAME,
  resolveGcliCommand,
  SystemdUserService,
  unitPath,
} from './daemon';
import { resolveOllamaUrl } from './ollama';
import { resolveRunner } from './start';

interface InstallOptions {
  name?: string;
  token?: string;
  ollama?: string;
  wsUrl?: string;
  reset?: boolean;
  service?: string;
  dryRun?: boolean;
}

/**
 * `gcli runner:daemon:install` - run the runner as a systemd user service.
 * The runner identity is resolved NOW (interactively, with the gcli login
 * session) and saved to ~/.graphql-server/runner.json, so the service only
 * runs `runner:start` and the unit file never contains the token.
 */
export const install = async (cmd: InstallOptions) => {
  assertSystemdAvailable();
  const serviceName = cmd.service || DEFAULT_SERVICE_NAME;

  const { command, warning } = resolveGcliCommand();
  if (warning) {
    Logger.warn(warning);
  }
  // Resolved here: the service won't see this shell's OLLAMA_HOST.
  const ollamaUrl = resolveOllamaUrl(cmd.ollama);
  const execStart = [
    ...command,
    'runner:start',
    '--ollama',
    ollamaUrl,
    ...(cmd.wsUrl ? ['--wsUrl', cmd.wsUrl] : []),
  ];
  const unit = buildUnit({ serviceName, execStart });

  if (cmd.dryRun) {
    Logger.info(`Would write ${unitPath(serviceName)}:`);
    console.log(unit);
    return;
  }

  if (cmd.token) {
    if (cmd.reset) {
      await forgetRunner();
    }
    await saveRunner({
      id: '(from --token)',
      name: cmd.name ?? '',
      token: cmd.token,
      wsUrl: cmd.wsUrl,
    });
  } else {
    // Registers with the gcli login session if this machine has no runner yet.
    await resolveRunner({ name: cmd.name, reset: cmd.reset });
  }
  const runner = await readSavedRunner();

  const systemd = new SystemdUserService(serviceName);
  const path = await systemd.install(unit);
  Logger.log(
    `Runner "${runner?.name || runner?.id}" installed as systemd user service ${serviceName} (${path}) and started.`,
  );
  Logger.info(
    `Status: gcli runner:daemon:status   Logs: gcli runner:daemon:logs`,
  );
  if (!(await systemd.lingerEnabled())) {
    Logger.warn(
      'It stops when you log out and starts at your next login. To keep it running ' +
        `and start it at boot: sudo loginctl enable-linger ${process.env.USER ?? '$USER'}`,
    );
  }
};

export const uninstall = async (cmd: { service?: string }) => {
  assertSystemdAvailable();
  const serviceName = cmd.service || DEFAULT_SERVICE_NAME;
  const path = await new SystemdUserService(serviceName).uninstall();
  Logger.log(
    `Stopped and removed ${serviceName} (${path}). The runner itself is still registered - ` +
      '`gcli runner:delete` revokes it.',
  );
};

export const status = async (cmd: { service?: string }) => {
  assertSystemdAvailable();
  const serviceName = cmd.service || DEFAULT_SERVICE_NAME;
  console.log(await new SystemdUserService(serviceName).status());
};

/** Follows the service log (journalctl) until Ctrl+C. */
export const logs = (cmd: { service?: string; lines?: string }) => {
  assertSystemdAvailable();
  const serviceName = cmd.service || DEFAULT_SERVICE_NAME;
  return new Promise<void>((resolve) => {
    spawn(
      'journalctl',
      ['--user', '-u', `${serviceName}.service`, '-f', '-n', cmd.lines || '50'],
      { stdio: 'inherit' },
    ).on('exit', () => resolve());
  });
};
