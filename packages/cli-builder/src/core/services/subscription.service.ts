/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Container,
  Injectable,
  subscribeToTopic,
  WebSocketLink
} from '@gapi/core';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { gql } from 'apollo-server-core';
import { createHash } from 'crypto';
import { networkInterfaces } from 'os';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import { Environment } from '../../app.constants';
import { EnumToken } from '../../app.tokents';
import { executeAction } from '../executors/commands';

const webSocketImpl = require('ws');
interface MachineStatus {
  machineHash: string;
  data?: string;
  error?: string;
}
const machineHash = createHash('md5')
  .update(JSON.stringify(networkInterfaces()))
  .digest('base64');

export interface IInstanceConnectionType {
  command?: number | null;
  args?: string | null;
  cwd?: string | null;
}
@Injectable({
  init: true
})
export class SubscriptionService {
  subscription: Subscription;
  currentSubscriptionUri: string;
  private link: WebSocketLink;
  constructor() {
    if (Environment.SUBSCRIPTION_URI) {
      this.subscribe(
        Environment.SUBSCRIPTION_URI,
        Environment.AUTHORIZATION_TOKEN,
        Environment.WORKER_TYPE
      );
    }
  }
  async subscribe(
    uri: string,
    authorization?: string,
    worker_type?: string
  ) {
    this.currentSubscriptionUri = uri;
    this.link = new WebSocketLink({
      uri,
      options: {
        connectionParams: {
          authorization,
          machineHash,
          worker_type,
          networkInterfaces: JSON.stringify(
            networkInterfaces()
          )
        },
        reconnect: true
      },
      webSocketImpl
    });

    this.subscription = subscribeToTopic<{
      data: { registerWorker: IInstanceConnectionType };
    }>(
      gql`
        subscription($machineHash: String!) {
          registerWorker(machineHash: $machineHash) {
            command
            args
            cwd
          }
        }
      `,
      {
        machineHash
      },
      this.link
    )
      .pipe(map(({ data }) => data.registerWorker))
      .subscribe(async ({ args, command, cwd }) => {
        const cmd = Container.get(EnumToken)[command];
        if (!cmd) {
          throw new Error('Missing command');
        }
        try {
          const data = await executeAction(command)(
            JSON.parse(args),
            cwd
          );
          await this.sendStatus({
            machineHash,
            data: JSON.stringify(data)
          });
        } catch (error) {
          await this.sendStatus({
            machineHash,
            error: JSON.stringify(error)
          });
        }
      }, console.error);
    return this.subscription;
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closePubsub() {
    if (this.link) {
      const subscriptionClient = this.link[
        'subscriptionClient'
      ] as SubscriptionClient;
      subscriptionClient.unsubscribeAll();
      subscriptionClient.close();
    }
  }

  async sendStatus(variables: MachineStatus) {
    if (Environment.SEND_RESPONSE_TO_SERVER) {
      await this.sendMachineStatus(variables);
    }
  }

  sendMachineStatus(variables: MachineStatus) {
    const client = new ApolloClient({
      link: this.link,
      cache: new InMemoryCache()
    });
    return client.mutate({
      mutation: gql`
        mutation notifyMachineResult(
          $machineHash: String!
          $data: String!
          $error: String
        ) {
          notifyMachineResult(
            machineHash: $machineHash
            data: $data
            error: $error
          ) {
            status
          }
        }
      `,
      variables
    });
  }
}
