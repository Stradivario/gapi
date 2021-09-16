import { registerAuthCommands } from './auth';
import { registerLambdaCommands } from './lambda';
import { registerProjectCommands } from './project';

export const commands = [
  registerAuthCommands,
  registerLambdaCommands,
  registerProjectCommands,
];
