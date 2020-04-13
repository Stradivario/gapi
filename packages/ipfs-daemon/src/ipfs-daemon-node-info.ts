import { Service } from '@rxdi/core';

import { DaemonNodeInfo } from './ipfs-daemon-injection';

@Service()
export class IpfsDaemonInfoService {
  info: DaemonNodeInfo;

  setInfo(info: DaemonNodeInfo) {
    this.info = info;
  }

  getInfo(): DaemonNodeInfo {
    return this.info;
  }
}
