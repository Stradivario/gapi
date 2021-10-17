/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BootstrapLogger,
  CacheLayer,
  CacheLayerItem,
  CacheService,
  Container,
  Service,
} from '@rxdi/core';

@Service()
export class RequestCacheService extends CacheService {
  cacheLayer: CacheLayer<CacheLayerItem<any>>;
  constructor() {
    super(Container.get(BootstrapLogger));
    this.cacheLayer = this.createLayer({ name: 'request-cache-layer' });
  }

  put(key, data) {
    return this.cacheLayer.putItem({ key, data });
  }

  get(key) {
    return this.cacheLayer.getItem(key);
  }
}
