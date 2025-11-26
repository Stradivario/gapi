import { Module, ModuleWithServices } from '@rxdi/core';
import { FalkorDB as FalkorDb } from 'falkordb';

import { FalkorDB, FalkorDBConfig } from './falkordb.config';

@Module()
export class FalkorDBModule {
  static forRoot(config: FalkorDBConfig): ModuleWithServices {
    return {
      module: FalkorDBModule,
      providers: [
        {
          provide: FalkorDBConfig,
          useValue: config,
        },
        {
          provide: FalkorDB,
          deps: [FalkorDBConfig],
          lazy: true,
          useFactory: (config: FalkorDBConfig) => FalkorDb.connect(config),
        },
      ],
    };
  }
}

export * from './falkordb.config';
