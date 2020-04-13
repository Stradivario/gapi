import { Service } from '@rxdi/core';

import { IpfsPubSubRoom } from './ipfs-pubsub-injection';

@Service()
export class IpfsPubSubConfig {
  logging?: boolean;
  rooms: Array<IpfsPubSubRoom>;
}
