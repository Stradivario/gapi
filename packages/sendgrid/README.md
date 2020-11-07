```ts
import { SendgridModule } from '@gapi/sendgrid';
import { Module } from '@rxdi/core';

import { ProfilingRequestTemplate } from './email-templates/profile-request.template';
import { SubscriptionTemplate } from './email-templates/subscription.template';

@Module({
  imports: [
    SendgridModule.forRoot({
      templates: [
        {
          type: 'subscribe',
          subject: 'Thank you for subscribing to Graphql Server feed!',
          // tslint:disable-next-line:max-line-length
          text: `From now on, you'll get regular updates. Cheers, Graphql Server`,
          asyncHtml: SubscriptionTemplate,
          from: null,
          to: null,
        },
        {
          type: 'profiling',
          subject: 'Thank you for your profiling request!',
          text: `You have successfully requested free profiling.`,
          asyncHtml: ProfilingRequestTemplate,
          from: null,
          to: null,
        },
      ],
      apiKey: 'SENDGRID_API_KEY',
      defaultEmail: 'kristiqn.tachev@gmail.com',
    }),
  ],
})
export class CoreModule {}
```
