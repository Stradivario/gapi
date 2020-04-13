import { Injectable } from '@gapi/core';

import { KafkaConfig } from './kafka.interface';

@Injectable()
export class KafkaConfigService extends KafkaConfig {
  constructor() {
    super();
  }
}
