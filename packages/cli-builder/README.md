# @Gapi Graphql CLI Builder

## Installation:

```bash
$ npm install @gapi/cli-builer
```

```ts
import {
  CLIBuilder,
  Environment,
  GenericEnum,
  executeCommand
} from '@gapi/cli-builder';
import {
  Bootstrap,
  Container,
  HAPI_SERVER
} from '@gapi/core';
import { Server } from 'hapi';

import { SpawnOptionsWithoutStdio } from 'child_process';

export const Git = (
  args: string[] = [],
  options?: SpawnOptionsWithoutStdio
) => executeCommand('git', args, options);

export enum Commands {
  GIT = 1
}

Bootstrap(
  CLIBuilder.forRoot<typeof Commands>(
    {
      GIT: async (args: string[]) => {
        console.log('[RUN_GIT]: started arguments: ', args);
        const data = await Git(args);
        console.log('[RUN_GIT]: exited');
        return data;
      }
    },
    Commands
  )
).subscribe(() => {
  if (Environment.SUBSCRIPTION_URI) {
    console.log(
      'STARTED_SUBSCRIPTIONS:',
      Environment.SUBSCRIPTION_URI
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
```
