import { Service } from '@rxdi/core';

import { GapiIpfsConfig } from './ipfs-config';

@Service()
export class GapiIpfsLogger {
  constructor(private config: GapiIpfsConfig) {}

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
