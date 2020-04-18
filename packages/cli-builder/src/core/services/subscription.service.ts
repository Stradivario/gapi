/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Container,
  Injectable,
  subscribeToTopic,
  WebSocketLink
} from '@gapi/core';
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
  subscribe(
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
        await executeAction(command)(JSON.parse(args), cwd);
      }, console.error);
    return this.subscription;
  }

  unsubscribe() {
    if (this.link) {
      const subscriptionClient = this.link[
        'subscriptionClient'
      ] as SubscriptionClient;
      subscriptionClient.close();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
