import { GraphQLObjectType, GraphQLString } from 'graphql';

export const SubscriptionStatusType = new GraphQLObjectType({
  name: 'SubscriptionStatusType',
  fields: () => ({
    status: {
      type: GraphQLString
    }
  })
});
