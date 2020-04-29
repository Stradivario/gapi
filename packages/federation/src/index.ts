import { ApolloGateway } from '@apollo/gateway';
import { Module, ModuleWithProviders } from '@rxdi/core';
import { ApolloServer } from 'apollo-server';

import { AuthenticatedDataSource } from './auth-data-source';
import { ApolloGatewayInternal, ApolloServerInternal } from './tokens';

@Module()
export class FederationModule {
  public static forRoot({
    port,
    serviceList,
    willSendRequest,
  }: {
    port: number;
    willSendRequest?: (ctx: { request; context }) => void;
    serviceList: { name: string; url: string }[];
  }): ModuleWithProviders {
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
              context: ({ req: { headers } }) => headers,
              subscriptions: false,
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
