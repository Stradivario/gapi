import { Injectable } from '@gapi/core';
import { KafkaPubSub } from 'graphql-kafka-subscriptions';
import { PubSub } from 'graphql-subscriptions';

import { KafkaConfig } from './kafka.interface';

@Injectable()
export class GapiKafkaPubSubService {
  sub: KafkaPubSub | PubSub;
  constructor(config: KafkaConfig, pubSub?: KafkaPubSub | PubSub) {
    if (pubSub) {
      this.sub = pubSub;
    } else if (process.env.NODE_ENV === 'production') {
      this.sub = new KafkaPubSub({
        topic: 'anything',
        host: 'INSERT_KAFKA_IP',
        port: 'INSERT_KAFKA_PORT'
      });
    } else {
      this.sub = new PubSub();
    }
  }
  asyncIterator<T>(event): AsyncIterator<T> {
    return this.sub.asyncIterator<T>(event);
  }
  publish(triggerName: string, payload): boolean {
    return this.sub.publish(triggerName, payload);
  }
}
