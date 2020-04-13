import { Service } from '@rxdi/core';

import { Id } from './ipfs-injection';

@Service()
export class GapiIpfsNodeInfoService {
  info: Id;

  setInfo(info: Id) {
    this.info = info;
  }

  getInfo(info: Id) {
    this.info = info;
  }
}
