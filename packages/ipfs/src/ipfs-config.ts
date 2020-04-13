import { Service } from '@rxdi/core';

import { Options } from './ipfs-injection';

@Service()
export class GapiIpfsConfig extends Options {
  logging?: boolean;
}
