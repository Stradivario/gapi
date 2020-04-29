```ts
import { FederationModule } from '@gapi/federation';

Bootstrap(
  FederationModule.forRoot({
    port: 4000,
    willSendRequest({ request, context }) {
      request.http.headers.set('authorization', context.authorization);
    },
    serviceList: [
      { name: 'accounts', url: 'http://localhost:9000/graphql' },
      { name: 'products', url: 'http://localhost:9001/graphql' },
    ],
  }),
).subscribe(() => console.log('started'));
```
