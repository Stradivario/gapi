/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, ModuleWithServices } from '@rxdi/core';

import { DaemonConfig, DaemonLink } from './daemon.interface';
import { AfterStart } from './services/after-start.service';
import { DaemonService } from './services/daemon.service';

@Module()
export class DaemonModule {
  public static forRoot(options: DaemonConfig = {} as any): ModuleWithServices {
    return {
      module: DaemonModule,
      providers: [
        ...(options.activated
          ? [
              DaemonService,
              AfterStart,
              {
                provide: DaemonLink,
                useValue: options.link || 'http://localhost:42000/graphql'
              }
            ]
          : [])
      ]
    };
  }
}

export * from './daemon.interface';
