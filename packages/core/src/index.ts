import { Module, ModuleWithServices } from '@rxdi/core';
import { GraphQLModule } from '@rxdi/graphql';
import { GraphQLPubSubModule } from '@rxdi/graphql-pubsub';
import { HapiModule } from '@rxdi/hapi';

import { FederationController } from './federation.controller';
import { CoreModuleConfig, DEFAULT_CONFIG } from './tokens';

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
      ],
    };
  }
}

export * from './enum-to-gql';
export { GeoJSON } from './geojson.types';
export * from '@rxdi/core';
export * from '@rxdi/graphql';
export * from '@rxdi/graphql-pubsub';
export { withFilter } from '@rxdi/graphql-rabbitmq-subscriptions';
export * from '@rxdi/hapi';
export * from 'graphql';
// Explicit re-export of the lambda-aware Bootstrap MUST come after the
// `export * from '@rxdi/core'` above so it shadows the upstream Bootstrap.
// Outside Lambforge (LAMBFORGE_RUNTIME unset), this delegates verbatim.
export {
  awaitLambdaModule,
  Bootstrap,
  deliverLambdaModule,
  isLambdaModuleDelivered,
  isLambdaRuntime,
  resetLambdaBridge,
} from './lambda-bridge';
export {
  buildSchema,
  ExecutionResult,
  extendSchema,
  isSpecifiedScalarType,
} from 'graphql';
export {
  FilterFn,
  PubSubEngine,
  PubSubOptions,
  ResolverFn,
} from 'graphql-subscriptions';
