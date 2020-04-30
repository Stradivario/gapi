import { Bootstrap, Container } from '@rxdi/core';
import { existsSync, readFileSync } from 'fs';
import { printSchema } from 'graphql';

import { ApolloGatewayInternal, FederationModule } from '../src/index';

const [, , file] = process.argv;
const configFile =
  file ||
  (process.env.GATEWAY_CONFIG
    ? process.env.GATEWAY_CONFIG
    : './gateway.config.json');

const config = existsSync(configFile)
  ? JSON.parse(readFileSync(configFile, { encoding: 'utf-8' }))
  : {
      port: process.env.GATEWAY_PORT,
      serviceList: process.env.GATEWAY_SERVICE_LIST
        ? JSON.parse(process.env.GATEWAY_SERVICE_LIST)
        : [{ name: 'no-name', url: 'http://localhost:9000/graphql' }],
    };

Bootstrap(FederationModule.forRoot(config)).subscribe(
  () => {
    Container.get(ApolloGatewayInternal).onSchemaChange((schema) =>
      console.log(`
${process.env.GATEWAY_PRINT_SCHEMA ? `Schema: ${printSchema(schema)}` : ''}
Loaded remote graphs:
${config.serviceList.map((s) => `\n1. ${s.name} - ${s.url}`)}
`),
    );
  },
  (e) => console.log(e),
);
