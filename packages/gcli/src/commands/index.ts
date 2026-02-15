import { registerAuthCommands } from './auth';
import { buildCommands } from './build';
import { registerEnvironmentCommands } from './environment';
import { registerLambdaCommands } from './lambda';
import { registerProjectCommands } from './project';

export const commands = [
  registerAuthCommands,
  registerLambdaCommands,
  registerProjectCommands,
  buildCommands,
  registerEnvironmentCommands,
];
