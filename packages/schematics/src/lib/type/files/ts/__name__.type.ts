import { GraphQLString, GraphQLObjectType } from '@gapi/core';

export const <%= classify(name) %>Type = new GraphQLObjectType({
    name: '<%= classify(name) %>Type',
    fields: {
        init: {
            type: GraphQLString
        }
    }
});