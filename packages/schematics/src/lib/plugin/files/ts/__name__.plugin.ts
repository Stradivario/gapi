

import { Plugin, PluginInterface, Inject } from '@rxdi/core';
import { HAPI_SERVER } from '@rxdi/hapi';
import { Server } from 'hapi';

@Plugin()
export class <%= classify(name) %>Plugin implements PluginInterface {
  name = 'MyPlugin';
  version = '1.0.0';

  constructor(
    @Inject(HAPI_SERVER) private server: Server
  ) {}

  async register() {
    this.server.route({
      method: '<%= classify(method) %>',
      path: '/<%= dasherize(name) %>',
      handler: this.handler.bind(this)
    });
  }

  async handler(request, h) {
    return 'Hello world';
  }

}
