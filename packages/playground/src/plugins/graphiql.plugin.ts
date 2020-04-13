import { Inject, Plugin } from '@rxdi/core';
import { HAPI_SERVER } from '@rxdi/hapi';
import { renderPlaygroundPage } from 'graphql-playground-html';
import { Request, ResponseToolkit, Server } from 'hapi';

import { PLAYGROUND_CONFIG, PlaygroundConfig } from '../palyground.config';

@Plugin()
export class GraphiQLPlaygroundPlugin {
  constructor(
    @Inject(HAPI_SERVER) private server: Server,
    @Inject(PLAYGROUND_CONFIG) private config: PlaygroundConfig
  ) {}

  async register() {
    if (this.config.graphiqlPlayground) {
      this.server.route({
        method: 'GET',
        path: this.config.path,
        handler: this.handler.bind(this)
      });
    }
  }

  async handler(request: Request, h: ResponseToolkit) {
    return h.response(renderPlaygroundPage(this.config)).type('text/html');
  }
}
