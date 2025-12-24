import { DaemonConfig, DaemonModule } from '@gapi/daemon';
import { Module, ModuleWithServices } from '@rxdi/core';
import { GRAPHQL_PLUGIN_CONFIG, GraphQLModule } from '@rxdi/graphql';
import {
  GRAPHQL_PUB_SUB_DI_CONFIG,
  GraphQLPubSubModule,
} from '@rxdi/graphql-pubsub';
import { HapiConfigModel, HapiModule } from '@rxdi/hapi';

import { FederationController } from './federation.controller';

export interface CoreModuleConfig {
  server?: HapiConfigModel;
  graphql?: GRAPHQL_PLUGIN_CONFIG;
  pubsub?: GRAPHQL_PUB_SUB_DI_CONFIG;
  daemon?: DaemonConfig;
}

const DEFAULT_CONFIG: CoreModuleConfig = {
  server: {
    hapi: {
      port: 9000,
    },
  },
  graphql: {
    path: '/graphql',
    initQuery: true,
    writeEffects: false,
    watcherPort: '',
    graphqlOptions: {
      schema: null,
    },
    altair: {
      enabled: true,
    },
  },
  daemon: {
    activated: false,
  },
};

@Module()
export class CoreModule {
  public static forRoot(config?: CoreModuleConfig): ModuleWithServices {
    config = config || DEFAULT_CONFIG;
    return {
      module: CoreModule,
      controllers: [FederationController],
      frameworkImports: [
        HapiModule.forRoot({ ...DEFAULT_CONFIG.server, ...config.server }),
        GraphQLModule.forRoot({ ...DEFAULT_CONFIG.graphql, ...config.graphql }),
        GraphQLPubSubModule.forRoot(config.pubsub),
        DaemonModule.forRoot(config.daemon),
      ],
    };
  }
}

export * from './enum-to-gql';
export * from '@rxdi/core';
export * from '@rxdi/graphql';
export * from '@rxdi/graphql-pubsub';
export { withFilter } from '@rxdi/graphql-rabbitmq-subscriptions';
export * from '@rxdi/hapi';
export * from 'graphql';
export {
  buildSchema,
  ExecutionResult,
  extendSchema,
  isSpecifiedScalarType,
} from 'graphql';
export * from 'graphql-geojson';
export {
  FilterFn,
  PubSubEngine,
  PubSubOptions,
  ResolverFn,
} from 'graphql-subscriptions';
export * from 'graphql-tools';
