import { DocumentNode, InjectionToken } from '@gapi/core';
import { gql } from 'apollo-server-core';
import { createHash } from 'crypto';
import { networkInterfaces } from 'os';

import { Environment } from './app.constants';

export const CommandsToken = new InjectionToken();
export const EnumToken = new InjectionToken();
export const SubscriptionQuery = new InjectionToken<
  NetworkItem
>();

export type SubscriptionQuery = NetworkItem;
export const MachineStatusQuery = new InjectionToken<
  NetworkItem
>();

export type MachineStatusQuery = NetworkItem;

export interface NetworkItem {
  query: DocumentNode;
  variables?: unknown;
  map?: (i) => unknown;
}

export const machineHash = createHash('md5')
  .update(JSON.stringify(networkInterfaces()))
  .digest('base64');

export class Network {
  subscription: NetworkItem = {
    query: gql`
      subscription($machineHash: String!, $label: String!) {
        registerWorker(
          machineHash: $machineHash
          label: $label
        ) {
          command
          args
          cwd
        }
      }
    `,
    variables: {
      machineHash,
      label: Environment.GRAPHQL_RUNNER_LABEL,
    },
    map: (i) => i.registerWorker,
  };
  status: NetworkItem = {
    query: gql`
      mutation notifyMachineResult(
        $label: String
        $machineHash: String
        $data: String
        $error: String
      ) {
        notifyMachineResult(
          label: $label
          machineHash: $machineHash
          data: $data
          error: $error
        ) {
          status
        }
      }
    `,
  };
}
