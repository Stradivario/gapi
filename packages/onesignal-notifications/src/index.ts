import { Container, Module, ModuleWithServices } from '@rxdi/core';

import { OneSignalClientService } from './client';
import { OneSignalConfig } from './onesignal.config';

@Module()
export class OneSignalModule {
  static forRoot(config: OneSignalConfig): ModuleWithServices {
    Container.set(OneSignalClientService, new OneSignalClientService(config));
    return {
      module: OneSignalModule,
    };
  }
}

export * from './notification';
export * from './client';
export * from './interfaces/index';
