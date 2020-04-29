import { ApolloGateway } from '@apollo/gateway';
import { InjectionToken } from '@rxdi/core';
import { ApolloServer } from 'apollo-server';

export const ApolloServerInternal = new InjectionToken();
export type ApolloServerInternal = ApolloServer;

export const ApolloGatewayInternal = new InjectionToken();
export type ApolloGatewayInternal = ApolloGateway;
