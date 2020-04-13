import { InjectionToken } from '@rxdi/core';

export interface IpfsPubSubRoom {
  topic: string;
}

export const IpfsPubSubRoom = new InjectionToken<IpfsPubSubRoom>(
  'ipfs-pubsub-injection'
);
