import {
  Controller,
  GraphQLControllerOptions,
  Mutation
} from '@gapi/core';
import { GraphQLNonNull, GraphQLString } from 'graphql';

import { GenericCommandType } from './app.types';
import { SubscriptionService } from './core/services/subscription.service';

@Controller<GraphQLControllerOptions>({
  guards: [],
  type: GenericCommandType
})
export class AppController {
  stoppedListener: NodeJS.Timeout;

  constructor(
    private subscriptionService: SubscriptionService
  ) {}

  @Mutation({
    uri: {
      type: GraphQLNonNull(GraphQLString)
    },
    authorization: {
      type: GraphQLString
    },
    worker_type: {
      type: GraphQLString
    }
  })
  subscribeToGraphqlPubsub(
    root,
    { uri, worker_type, authorization }
  ) {
    this.subscriptionService.unsubscribe();
    this.subscriptionService.subscribe(
      uri,
      authorization,
      worker_type || 'runner'
    );
    return {
      data: `Success subscribed to pubsub ${uri}`
    };
  }

  @Mutation()
  unsubscribeToGraphqlPubsub() {
    this.subscriptionService.unsubscribe();
    return {
      data: `Success unsubscribed from ${this.subscriptionService.currentSubscriptionUri}`
    };
  }
}
