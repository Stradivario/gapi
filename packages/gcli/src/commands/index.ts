import { registerAuthCommands } from './auth';
import { buildCommands } from './build';
import { registerClusterCommands } from './cluster';
import { registerEnvironmentCommands } from './environment';
import { registerLambdaCommands } from './lambda';
import { registerPluginCommands } from './plugin';
import { registerProjectCommands } from './project';
import { registerMcpCommands } from './proxy';
import { registerRabbitMqCommands } from './rabbitmq';
import { startCommands } from './start';
import { registerCronTriggerCommands } from './triggers/cron';

export const commands = [
  registerAuthCommands,
  registerLambdaCommands,
  registerProjectCommands,
  buildCommands,
  registerEnvironmentCommands,
  registerMcpCommands,
  startCommands,
  registerCronTriggerCommands,
  registerClusterCommands,
  registerRabbitMqCommands,
  registerPluginCommands,
];
