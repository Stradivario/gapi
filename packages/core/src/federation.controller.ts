import { Container, Controller } from '@rxdi/core';
import { GRAPHQL_PLUGIN_CONFIG, Query, Type } from '@rxdi/graphql';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  printSchema,
} from 'graphql';

import { FedarationReplacer, GRAPHQL_FEDERATION_REPLACER } from './tokens';

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

    const schema = new GraphQLSchema({
      query: appSchema.graphqlOptions.schema.getQueryType(),
      mutation: appSchema.graphqlOptions.schema.getMutationType(),
    });
    let replacer = FedarationReplacer;
    try {
      replacer = Container.get(GRAPHQL_FEDERATION_REPLACER);
    } catch (e) {}
    const sdl = printSchema(schema)
      .replace('_service: GraphqlFederation', '')
      .replace('status: StatusQueryType', '');
    return {
      sdl: replacer(sdl),
    };
  }
}
