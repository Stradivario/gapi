import { IPFS } from '@gapi/ipfs';
import { Module, ModuleWithServices } from '@rxdi/core';

import { IpfsPubSubConfig } from './ipfs-pubsub-config';
import { IpfsPubSubRoom } from './ipfs-pubsub-injection';
import { IpfsPubsubTopicService } from './services';
import Room = require('ipfs-pubsub-room');

@Module({
  services: [IpfsPubSubConfig],
})
export class IpfsPubSubModule {
  static forRoot(config?: IpfsPubSubConfig): ModuleWithServices {
    const ROOMS = [];
    config.rooms.map((room) =>
      ROOMS.push({
        provide: room,
        deps: [IPFS, IpfsPubSubRoom, IpfsPubsubTopicService],
        lazy: true,
        useFactory: (
          ipfs: IPFS,
          pubsub,
          topicService: IpfsPubsubTopicService
        ) => {
          ipfs.on('ready', () => {
            console.log(`Ipfs pubsub -> Joined to room: ${room.topic}`);
          });
          return topicService.setTopic(pubsub(ipfs, room.topic));
        },
      })
    );
    return {
      module: IpfsPubSubModule,
      services: [
        IpfsPubsubTopicService,
        { provide: IpfsPubSubConfig, useValue: config || {} },
        { provide: IpfsPubSubRoom, useValue: Room },
        ...ROOMS,
      ],
    };
  }
}

export * from './ipfs-pubsub-config';
export * from './ipfs-pubsub-injection';
export * from './ipfs-pubsub-logger';
