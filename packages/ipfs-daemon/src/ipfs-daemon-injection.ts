import { InjectionToken } from '@rxdi/core';

export const initIpfsDaemonOptions = {
  Addresses: {
    API: '/ip4/127.0.0.1/tcp/5001',
    Gateway: '/ip4/127.0.0.1/tcp/8080',
    Swarm: ['/ip4/0.0.0.0/tcp/4001', '/ip6/::/tcp/4001'],
  },
};
export class Options {
  port?: string;
  remote = false;
  type?: 'go' | 'js' | 'proc' = 'js';
  config?: {
    Addresses?: {
      API?: string;
      Announce?: unknown[];
      Gateway?: string;
      NoAnnounce?: unknown[];
      Swarm?: string[];
    };
  } = initIpfsDaemonOptions;
}
export interface DaemonNodeInfo {
  apiHost: string;
  apiPort: string;
  gatewayHost: string;
  gatewayPort: string;
}

export const IPFS_DAEMON = new InjectionToken('gapi-ipfs-daemon-injection');
