import {
  Controller,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  Interceptor,
  Mutation,
  PubSubService,
  Query,
  Subscribe,
  Subscription,
  Type,
} from '@gapi/core';
import { Observable } from 'rxjs';

import { ILinkListType } from './api-introspection';
import { NotifyInterceptor } from './core/interceptors/notify.interceptor';
import { DaemonService } from './core/services/daemon.service';
import { ListService } from './core/services/list.service';
import { LinkListType } from './types/link-list.type';
import { ServerMetadataInputType } from './types/server-metadata.type';

@Controller()
export class ServerController {
  constructor(
    private listService: ListService,
    private daemonService: DaemonService,
    private pubsub: PubSubService
  ) {
    let count = 0;
    setInterval(() => {
      pubsub.publish('CREATE_SIGNAL_BASIC', count++);
    }, 2000);
  }

  @Type(LinkListType)
  @Subscribe((self: ServerController) =>
    self.pubsub.asyncIterator('CREATE_SIGNAL_BASIC')
  )
  @Interceptor(NotifyInterceptor)
  @Subscription()
  statusSubscription(message) {
    return {
      repoPath: message,
    };
  }

  @Type(new GraphQLList(LinkListType))
  @Query()
  getLinkList() {
    return this.listService.readList();
  }

  @Type(LinkListType)
  @Interceptor(NotifyInterceptor)
  @Mutation({
    repoPath: {
      type: new GraphQLNonNull(GraphQLString),
    },
    introspectionPath: {
      type: GraphQLString,
    },
    linkName: {
      type: GraphQLString,
    },
    serverMetadata: {
      type: ServerMetadataInputType,
    },
  })
  notifyDaemon(root, payload: ILinkListType): Observable<ILinkListType> {
    return this.daemonService.notifyDaemon(payload);
  }
}
