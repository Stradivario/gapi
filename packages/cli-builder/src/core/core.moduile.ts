import { Module } from '@gapi/core';

import { SubscriptionService } from './services/subscription.service';

@Module({
  providers: [SubscriptionService]
})
export class CoreModule {}
