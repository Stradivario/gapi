import { Inject, Plugin, PluginInterface } from '@rxdi/core';
import { HAPI_SERVER } from '@rxdi/hapi';
import renderVoyagerPage from 'graphql-voyager/middleware/render-voyager-page';
import { Server } from 'hapi';

import { VoyagerConfig, VoyagerConfigModel } from './voyager-config';

@Plugin()
export class VoyagerGapiHapiPlugin implements PluginInterface {
  name = 'VoyagerGapiHapiPlugin';
  version = '1.0.0';

  constructor(
    @Inject(VoyagerConfig) private config: VoyagerConfigModel,
    @Inject(HAPI_SERVER) private server: Server
  ) {}

  async register() {
    this.server.route({
      method: 'GET',
      path: this.config.path,
      handler: this.handler.bind(this),
    });
  }
  handler() {
    return renderVoyagerPage({ endpointUrl: this.config.endpointUrl });
  }
}
