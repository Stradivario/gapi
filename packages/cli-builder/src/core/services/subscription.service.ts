/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Container,
  Inject,
  Injectable,
  subscribeToTopic,
  WebSocketLink,
} from '@gapi/core';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { networkInterfaces } from 'os';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import { Environment } from '../../app.constants';
import {
  EnumToken,
  machineHash,
  MachineStatusQuery,
  SubscriptionQuery,
} from '../../app.tokents';
import { executeAction } from '../executors/commands';
import { getNetworkIP } from './get-ip-adresses';

const webSocketImpl = require('ws');
interface MachineStatus {
  machineHash: string;
  data?: string;
  error?: string;
}

export interface IInstanceConnectionType {
  command?: number | null;
  args?: string | null;
  cwd?: string | null;
}
@Injectable({
  init: true,
})
export class SubscriptionService {
  subscription: Subscription;
  currentSubscriptionUri: string;
  private link: WebSocketLink;
  constructor(
    @Inject(SubscriptionQuery)
    private subscriptionsQuery: SubscriptionQuery,
    @Inject(MachineStatusQuery)
    private machineStatusQuery: MachineStatusQuery
  ) {
    if (Environment.SUBSCRIPTION_URI) {
      this.subscribe(
        Environment.SUBSCRIPTION_URI,
        Environment.AUTHORIZATION_TOKEN,
        Environment.WORKER_TYPE,
        Environment.LABEL
      );
    }
  }
  async subscribe(
    uri: string,
    authorization?: string,
    worker_type?: string,
    label?: string
  ) {
    this.currentSubscriptionUri = uri;
    this.link = new WebSocketLink({
      uri,
      options: {
        connectionParams: {
          authorization,
          machineHash,
          worker_type,
          label,
          ip: await getNetworkIP(),
          networkInterfaces: JSON.stringify(
            networkInterfaces()
          ),
        },
        reconnect: true,
      },
      webSocketImpl,
    });

    this.subscription = subscribeToTopic<{
      data: { registerWorker: IInstanceConnectionType };
    }>(
      this.subscriptionsQuery.query,
      this.subscriptionsQuery.variables,
      this.link
    )
      .pipe(
        map(({ data }) => this.subscriptionsQuery.map(data))
      )
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
            data: JSON.stringify(data),
          });
        } catch (error) {
          await this.sendStatus({
            machineHash,
            data: '',
            error: JSON.stringify(error),
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
      cache: new InMemoryCache(),
    });
    return client.mutate({
      mutation: this.machineStatusQuery.query,
      variables,
    });
  }
}
