import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

export const CreateCompletionUsageType = new GraphQLObjectType({
  name: 'CreateCompletionUsageType',
  fields: () => ({
    prompt_tokens: {
      type: GraphQLInt,
    },
    completion_tokens: {
      type: GraphQLInt,
    },
    total_tokens: {
      type: GraphQLInt,
    },
  }),
});

export const CreateCompletionChoicesType = new GraphQLObjectType({
  name: 'CreateCompletionChoicesType',
  fields: () => ({
    text: {
      type: GraphQLString,
    },
    index: {
      type: GraphQLString,
    },
    logprobs: {
      type: GraphQLString,
    },
    finish_reason: {
      type: GraphQLString,
    },
  }),
});

export const CreateCompletionType = new GraphQLObjectType({
  name: 'CreateCompletionType',
  fields: () => ({
    id: {
      type: GraphQLString,
    },
    object: {
      type: GraphQLString,
    },
    created: {
      type: GraphQLInt,
    },
    model: {
      type: GraphQLString,
    },
    choices: {
      type: new GraphQLList(CreateCompletionChoicesType),
    },
    usage: {
      type: CreateCompletionUsageType,
    },
  }),
});
