import { GraphQLInputObjectType, GraphQLInt, GraphQLObjectType } from 'graphql';

export const ServerMetadataType = new GraphQLObjectType({
  name: 'ServerMetadataType',
  fields: () => ({
    port: {
      type: GraphQLInt
    }
  })
});

export const ServerMetadataInputType = new GraphQLInputObjectType({
  name: 'ServerMetadataInputType',
  fields: () => ({
    port: {
      type: GraphQLInt
    }
  })
});
