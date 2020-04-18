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
  Bootstrap,
  executeCommand,
  SpawnOptionsWithoutStdio
} from '@gapi/cli-builder';

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
      `Running at http://localhost:${Environment.API_PORT}`
    );
  }
});
```

Open http://localhost:42043`
Execute graphql query

```graphql
mutation {
  execute(cmd: GIT, args: ["status"]) {
    code
    data
    error
  }
}
```

Subscribing to other topic

```graphql
mutation subscribeToGraphqlPubsub {
  subscribeToGraphqlPubsub(
    uri: "ws://localhost:9000/subscriptions"
    worker_type: "runner"
  ) {
    code
    data
    error
  }
}

mutation unsubscribeToGraphqlPubsub {
  unsubscribeToGraphqlPubsub {
    code
    data
    error
  }
}
```
