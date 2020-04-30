import { ApolloGateway } from '@apollo/gateway';
import { InjectionToken } from '@rxdi/core';
import { ApolloServer } from 'apollo-server';

export const ApolloServerInternal = new InjectionToken<ApolloServer>();
export type ApolloServerInternal = ApolloServer;

export const ApolloGatewayInternal = new InjectionToken<ApolloGateway>();
export type ApolloGatewayInternal = ApolloGateway;
