import { Container, Inject, Service } from '@rxdi/core';
import { createHttpLink } from 'apollo-link-http';
import {
  introspectSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
} from 'graphql-tools';

import { MicroserviceInterface } from './microservice.interface';
import fetch = require('node-fetch');
import { GraphQLSchema } from 'graphql';

@Service()
export class ProxyService {
  constructor(
    @Inject('gapi-microservice-config')
    private microservices: MicroserviceInterface[],
    @Inject('gapi-microservice-config-auth')
    private configAuth: { authorization?: Function }
  ) {}

  public async getSchemaIntrospection(): Promise<GraphQLSchema> {
    return await this.mergeSchemas(
      await Promise.all(
        this.microservices.map((ep) => {
          console.log(`Microservice: ${ep.name} loaded!`);
          return this.getIntrospectSchema(ep);
        })
      )
    );
  }

  private mergeSchemas(allSchemas): GraphQLSchema {
    return mergeSchemas({ schemas: allSchemas });
  }

  private async getIntrospectSchema(
    microservice: MicroserviceInterface
  ): Promise<GraphQLSchema> {
    const headers = { authorization: '' };
    if (this.configAuth.authorization) {
      const Authorization = Container.get<{ sign: (params) => string }>(
        this.configAuth.authorization
      );
      headers.authorization = Authorization.sign({
        email: microservice.name,
        id: -1,
        scope: ['ADMIN'],
      });
    }
    const makeDatabaseServiceLink = () =>
      createHttpLink({ uri: microservice.link, fetch, headers });
    return makeRemoteExecutableSchema({
      schema: await introspectSchema(makeDatabaseServiceLink()),
      link: makeDatabaseServiceLink(),
    });
  }
}
