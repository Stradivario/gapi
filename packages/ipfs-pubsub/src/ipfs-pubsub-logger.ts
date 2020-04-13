import { Service } from '@rxdi/core';

import { IpfsPubSubConfig } from './ipfs-pubsub-config';

@Service()
export class IpfsPubSubLogger {
  constructor(private config: IpfsPubSubConfig) {}

  log(message) {
    if (this.config.logging) {
      console.log(message);
    }
  }

  err(message) {
    if (this.config.logging) {
      console.error(message);
    }
  }
}
