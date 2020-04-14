import { Controller, GraphQLControllerOptions, Query, Type } from '@gapi/core';
import { GraphQLObjectType, GraphQLString } from 'graphql';

export const <%= classify(name) %>Type = new GraphQLObjectType({
    name: '<%= classify(name) %>Type',
    fields: {
        init: {
            type: GraphQLString
        }
    }
});

@Controller<GraphQLControllerOptions>({
    guards: [],
    type: []
})
export class <%= classify(name) %>Controller {

    @Type(<%= classify(name) %>Type)
    @Query()
    initQuery() {
        return {};
    }
}
