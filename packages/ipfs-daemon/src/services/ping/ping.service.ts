import { Service } from '@rxdi/core';
import { get as HttpGet, IncomingMessage } from 'http';
import { get as HttpsGet } from 'https';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { IpfsDaemonInfoService } from '../../ipfs-daemon-node-info';

@Service()
export class PingService {
  private providers = {
    infura: 'https://ipfs.infura.io/ipfs/',
    cloudflare: 'https://cloudflare-ipfs.com/ipfs/',
    ipfsOriginal: 'https://ipfs.io/ipfs/',
    thisNode: `http://${this.ipfsDaemonNodeInfo.info.gatewayHost}:${this.ipfsDaemonNodeInfo.info.gatewayPort}/ipfs/`,
  };

  constructor(private ipfsDaemonNodeInfo: IpfsDaemonInfoService) {}

  ping(hash: string) {
    return this.httpObservable(`${this.providers.thisNode}${hash}`).pipe(
      switchMap(() =>
        combineLatest(
          this.httpObservable(`${this.providers.infura}${hash}`),
          this.httpObservable(`${this.providers.cloudflare}${hash}`),
          this.httpObservable(`${this.providers.ipfsOriginal}${hash}`)
        )
      )
    );
  }

  httpObservable(link: string): Observable<IncomingMessage> {
    return new Observable((o) => {
      if (link.includes('https')) {
        HttpsGet(link, (r) => {
          o.next(r);
          o.complete();
        });
      } else {
        HttpGet(link, (r) => {
          o.next(r);
          o.complete();
        });
      }
    });
  }
}
