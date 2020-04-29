import { Container, Controller } from '@rxdi/core';
import { GRAPHQL_PLUGIN_CONFIG, Query, Type } from '@rxdi/graphql';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  printSchema,
} from 'graphql';

@Controller()
export class FederationController {
  @Type(
    new GraphQLObjectType({
      name: 'GraphqlFederation',
      fields: () => ({ sdl: { type: GraphQLString } }),
    })
  )
  @Query()
  _service() {
    const appSchema = Container.get(
      GRAPHQL_PLUGIN_CONFIG
    ) as GRAPHQL_PLUGIN_CONFIG;
    return {
      sdl: printSchema(
        new GraphQLSchema({
          query: appSchema.graphqlOptions.schema.getQueryType(),
          mutation: appSchema.graphqlOptions.schema.getMutationType(),
        })
      ),
    };
  }
}
