import { DocumentNode, InjectionToken } from '@gapi/core';
import { gql } from 'apollo-server-core';
import { createHash } from 'crypto';
import { networkInterfaces } from 'os';

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
      subscription($machineHash: String!) {
        registerWorker(machineHash: $machineHash) {
          command
          args
          cwd
        }
      }
    `,
    variables: {
      machineHash,
    },
    map: (i) => i.registerWorker,
  };
  status: NetworkItem = {
    query: gql`
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
  };
}
