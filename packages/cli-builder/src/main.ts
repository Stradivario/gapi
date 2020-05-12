import {
  Bootstrap,
  Container,
  HAPI_SERVER,
} from '@gapi/core';
import { Server } from 'hapi';

import { Environment } from './app.constants';
import { CLIBuilder } from './cli-builder';
import { executeCommand } from './core/executors/helpers/index';
export enum Commands {
  GIT = 1,
  NPM = 2,
  DOCKER = 3,
  DOCKER_COMPOSE2 = 4,
}

Bootstrap(
  CLIBuilder.forRoot<
    typeof Commands,
    Promise<unknown>,
    string[]
  >(
    {
      GIT: async (args: string[]) => {
        console.log('[RUN_GIT]: started arguments: ', args);
        const data = await executeCommand('git', args);
        console.log('[RUN_GIT]: exited');
        return data;
      },
      NPM: async (args: string[]) => {
        console.log('[RUN_NPM]: started arguments: ', args);
        console.log('[RUN_NPM]: exited');
        return 1;
      },
      DOCKER: async (args: string[]) => {
        console.log(
          '[RUN_DOCKER]: started arguments: ',
          args
        );
        console.log('[RUN_DOCKER]: exited');
        return 1;
      },
      DOCKER_COMPOSE2: async (args: string[]) => {
        console.log(
          '[RUN_DOCKER_COMPOSE]: started arguments: ',
          args
        );
        console.log('[RUN_DOCKER_COMPOSE]: exited');
        return 1;
      },
    },
    Commands
  )
).subscribe(() => {
  if (Environment.GRAPHQL_RUNNER_SUBSCRIPTION_URI) {
    console.log(
      'STARTED_SUBSCRIPTIONS:',
      Environment.GRAPHQL_RUNNER_SUBSCRIPTION_URI
    );
  } else {
    console.log(
      'SIGNAL_MAIN_API_STARTED',
      `Running at http://localhost:${
        Container.get<Server>(HAPI_SERVER).info.port
      }`
    );
  }
});
