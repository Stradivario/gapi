import { Module, ModuleWithServices } from '@rxdi/core';

import { VoyagerConfig, VoyagerConfigModel } from './voyager-config';
import { VoyagerGapiHapiPlugin } from './voyager-plugin';

@Module({
  plugins: [VoyagerGapiHapiPlugin]
})
export class VoyagerModule {
  static forRoot(
    config: VoyagerConfigModel = new VoyagerConfigModel()
  ): ModuleWithServices {
    return {
      module: VoyagerModule,
      services: [
        {
          provide: VoyagerConfig,
          useValue: config
        }
      ]
    };
  }
}

export * from './voyager-plugin';
export * from './voyager-config';
