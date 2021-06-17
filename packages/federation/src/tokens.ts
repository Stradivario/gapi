import { ApolloGateway } from '@apollo/gateway';
import { InjectionToken } from '@rxdi/core';
import { ApolloServer } from 'apollo-server';
import { ContextFunction } from 'apollo-server-core';
import { ApolloServerExpressConfig } from 'apollo-server-express';

export const ApolloServerInternal = new InjectionToken<ApolloServer>();
export type ApolloServerInternal = ApolloServer;

export const ApolloGatewayInternal = new InjectionToken<ApolloGateway>();
export type ApolloGatewayInternal = ApolloGateway;
export type WillSendRequest = (ctx: { request; context }) => void;
export type FederationModuleOptions = {
  port: number | string;
  willSendRequest?: WillSendRequest;
  context?: ContextFunction;
  serviceList: { name: string; url: string }[];
  apolloServerConfig?: ApolloServerExpressConfig;
};
