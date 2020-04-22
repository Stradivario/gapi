import { Container, Module } from '@gapi/core';

import { KafkaConfigService } from './kafka-config.service';
import { KafkaConfig } from './kafka.interface';
import { GapiKafkaPubSubService } from './kafka.service';

@Module({
  services: [KafkaConfigService],
})
export class GapiKafkaModule {
  static forRoot(config: KafkaConfig) {
    Container.set(GapiKafkaPubSubService, new GapiKafkaPubSubService(config));
    return GapiKafkaModule;
  }
}

export * from './kafka.service';
export * from './kafka.interface';
export * from './kafka-config.service';
