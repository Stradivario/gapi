import { Module, ModuleWithServices } from '@rxdi/core';

import { MicroserviceInterface } from './microservice.interface';
import { ProxyService } from './proxy.service';

@Module()
export class MicroserviceModule {
  static forRoot(
    microservices: MicroserviceInterface[],
    config?: { authorization?: Function }
  ): ModuleWithServices {
    // tslint:disable-next-line:no-unused-expression
    config ? config : (config = { authorization: null });
    return {
      module: MicroserviceModule,
      services: [
        ProxyService,
        {
          provide: 'gapi-microservice-config-auth',
          useValue: config
        },
        {
          provide: 'gapi-microservice-config',
          useValue: microservices
        },
        {
          provide: 'gapi-custom-schema-definition',
          lazy: true,
          deps: [ProxyService],
          useFactory: async (proxyService: ProxyService) => {
            return await proxyService.getSchemaIntrospection();
          }
        }
      ]
    };
  }
}

export * from './proxy.service';
export * from './microservice.interface';
