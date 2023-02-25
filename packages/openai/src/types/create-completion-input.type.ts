import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

export const CreateCompletionInputType = new GraphQLInputObjectType({
  name: 'CreateCompletionInputType',
  fields: () => ({
    model: {
      type: new GraphQLNonNull(GraphQLString),
    },
    prompt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    max_tokens: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  }),
});
