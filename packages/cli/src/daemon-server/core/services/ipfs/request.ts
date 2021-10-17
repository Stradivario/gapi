import { BootstrapLogger, Injector, Service } from '@rxdi/core';
import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RequestCacheService } from './request-cache';

@Service()
export class RequestService {
  @Injector(RequestCacheService) private cache: RequestCacheService;
  @Injector(BootstrapLogger) private logger: BootstrapLogger;

  get(link: string) {
    if (this.cache.cacheLayer.map.has(link)) {
      this.logger.log(`Item returned from cacahe: ${link}`);
      return of(this.cache.cacheLayer.get(link).data);
    }
    return new Observable((o) => {
      if (link.includes('https://')) {
        httpsGet(link, (resp) => {
          let data = '';
          resp.on('data', (chunk) => (data += chunk));
          resp.on('end', () => o.next(data));
        }).on('error', (err) => {
          console.error('Error: ' + err.message);
          o.error(err);
        });
      } else {
        httpGet(link, (resp) => {
          let data = '';
          resp.on('data', (chunk) => (data += chunk));
          resp.on('end', () => o.next(data));
        }).on('error', (err) => {
          console.error('Error: ' + err.message);
          o.error(err);
        });
      }
    }).pipe(
      tap((res) => this.cache.cacheLayer.putItem({ key: link, data: res }))
    );
  }
}
