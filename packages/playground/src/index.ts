import { Module, ModuleWithServices } from '@rxdi/core';

import { PLAYGROUND_CONFIG, PlaygroundConfig } from './palyground.config';
import { GraphiQLPlaygroundPlugin } from './plugins';

@Module({
  plugins: [GraphiQLPlaygroundPlugin]
})
export class PlaygroundModule {
  public static forRoot(config?: PlaygroundConfig): ModuleWithServices {
    return {
      module: PlaygroundModule,
      services: [
        {
          provide: PLAYGROUND_CONFIG,
          useValue: config || {
            path: '/graphiql',
            endpoint: '/graphql',
            version: '1.7.1'
          }
        }
      ]
    };
  }
}
