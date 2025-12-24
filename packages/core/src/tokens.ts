import { InjectionToken } from '@rxdi/core';
import { GRAPHQL_PLUGIN_CONFIG } from '@rxdi/graphql';
import { GRAPHQL_PUB_SUB_DI_CONFIG } from '@rxdi/graphql-pubsub';
import { HapiConfigModel } from '@rxdi/hapi';

export const FedarationReplacer = (v: string) => v;
export const GRAPHQL_FEDERATION_REPLACER = new InjectionToken<
  typeof FedarationReplacer
>('GRAPHQL_FEDERATION_REPLACER');

export interface CoreModuleConfig {
  server?: HapiConfigModel;
  graphql?: GRAPHQL_PLUGIN_CONFIG;
  pubsub?: GRAPHQL_PUB_SUB_DI_CONFIG;
}

export const DEFAULT_CONFIG: CoreModuleConfig = {
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
  },
};
