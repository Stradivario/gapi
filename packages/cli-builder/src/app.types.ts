import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

export const GenericCommandType = new GraphQLObjectType({
  name: 'GenericCommandType',
  fields: {
    code: {
      type: GraphQLInt,
    },
    data: {
      type: GraphQLString,
    },
    error: {
      type: GraphQLString,
    },
  },
});
