import { IPFS } from '@gapi/ipfs';
import { Container, ExitHandlerService, Inject, Plugin } from '@rxdi/core';
import orbitDb from 'orbit-db';

import { OrbitDb } from './orbitdb-injection';

@Plugin()
export class OrbitDbPlugin {
  constructor(
    @Inject(IPFS) private ipfs: IPFS,
    private exitHandlerService: ExitHandlerService
  ) {}

  async register() {
    await Container.set(OrbitDb, new orbitDb(this.ipfs));
    const odbContainer: OrbitDb = Container.get(OrbitDb);
    this.exitHandlerService.errorHandler.subscribe(() => {
      odbContainer.stop();
      odbContainer.disconnect();
    });
  }
}
