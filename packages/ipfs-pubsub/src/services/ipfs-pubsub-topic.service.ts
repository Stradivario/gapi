import { Service } from '@rxdi/core';
import { BehaviorSubject } from 'rxjs';

import { IpfsPubSubRoom } from '../ipfs-pubsub-injection';

@Service()
export class IpfsPubsubTopicService {
  topics: BehaviorSubject<IpfsPubSubRoom[]> = new BehaviorSubject([]);

  setTopic(room: IpfsPubSubRoom): IpfsPubSubRoom | Function {
    this.topics.next([...this.topics.getValue(), room]);
    return this.findTopic(room.topic);
  }

  getTopics(): IpfsPubSubRoom[] {
    return this.topics.getValue();
  }

  findTopic(topic: string) {
    return (
      this.topics.getValue().filter((t) => t.topic === topic)[0] ||
      function () {
        throw new Error(`Ipfs pubsub -> Missing topic: ${topic}`);
      }
    );
  }
}
