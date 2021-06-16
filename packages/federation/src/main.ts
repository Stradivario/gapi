import { Bootstrap, Container } from '@rxdi/core';
import { ContextFunction } from 'apollo-server-core';
import { existsSync, readFileSync } from 'fs';
import { printSchema } from 'graphql';

import {
  ApolloGatewayInternal,
  FederationModule,
  FederationModuleOptions,
  WillSendRequest,
} from '../src/index';

let context: ContextFunction;
let willSendRequest: WillSendRequest;
const [, , file] = process.argv;
const configFile =
  file ||
  (process.env.GATEWAY_CONFIG
    ? process.env.GATEWAY_CONFIG
    : './gateway.config.json');

try {
  context = require('./gateway.context.js');
} catch (e) {}

try {
  willSendRequest = require('./gateway.request.js');
} catch (e) {}

const config: FederationModuleOptions = existsSync(configFile)
  ? JSON.parse(readFileSync(configFile, { encoding: 'utf-8' }))
  : ({
      port: process.env.GATEWAY_PORT,
      serviceList: process.env.GATEWAY_SERVICE_LIST
        ? JSON.parse(process.env.GATEWAY_SERVICE_LIST)
        : [{ name: 'no-name', url: 'http://localhost:9000/graphql' }],
    } as FederationModuleOptions);

Bootstrap(
  FederationModule.forRoot({ ...config, context, willSendRequest }),
).subscribe(
  () =>
    Container.get(ApolloGatewayInternal).onSchemaChange((schema) =>
      console.log(`
${process.env.GATEWAY_PRINT_SCHEMA ? `Schema: ${printSchema(schema)}` : ''}
Loaded remote graphs:
${config.serviceList.map((s) => `\n1. ${s.name} - ${s.url}`)}
`),
    ),
  console.error,
);
