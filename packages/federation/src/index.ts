import { ApolloGateway } from '@apollo/gateway';
import { Module, ModuleWithProviders } from '@rxdi/core';
import { ApolloServer } from 'apollo-server';

import { AuthenticatedDataSource } from './auth-data-source';
import {
  ApolloGatewayInternal,
  ApolloServerInternal,
  FederationModuleOptions,
} from './tokens';

@Module()
export class FederationModule {
  public static forRoot({
    port,
    serviceList,
    willSendRequest,
    context,
    apolloServerConfig,
  }: FederationModuleOptions): ModuleWithProviders {
    return {
      module: FederationModule,
      providers: [
        {
          provide: ApolloGatewayInternal,
          useFactory: () =>
            new ApolloGateway({
              serviceList,
              buildService: ({ url }) => {
                const auth = new AuthenticatedDataSource({ url });
                if (willSendRequest) {
                  auth.willSendRequest = willSendRequest.bind(auth);
                }
                return auth;
              },
              __exposeQueryPlanExperimental: true,
            }),
        },
        {
          provide: ApolloServerInternal,
          deps: [ApolloGatewayInternal],
          useFactory: (gateway: ApolloGatewayInternal) =>
            new ApolloServer({
              gateway,
              engine: false,
              context: context
                ? context
                : ({ req: { headers } }) => ({ headers }),
              subscriptions: false,
              ...apolloServerConfig,
            }),
        },
        {
          provide: 'Listen',
          deps: [ApolloServerInternal],
          lazy: true,
          useFactory: (server: ApolloServerInternal) =>
            server.listen({ port }).then(({ url }) => {
              console.log(`🚀 Gateway started at ${url}`);
            }),
        },
      ],
    };
  }
}

export * from './tokens';
