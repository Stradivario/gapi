import { GraphQLObjectType, GraphQLString } from 'graphql';

import { ServerMetadataType } from './server-metadata.type';

export const LinkListType = new GraphQLObjectType({
  name: 'LinkListType',
  fields: () => ({
    repoPath: {
      type: GraphQLString,
    },
    introspectionPath: {
      type: GraphQLString,
    },
    linkName: {
      type: GraphQLString,
    },
    serverMetadata: {
      type: ServerMetadataType,
    },
  }),
});
