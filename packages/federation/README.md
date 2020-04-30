# @gapi/federation

#### Download binary

```bash
wget https://github.com/Stradivario/gapi/tree/master/packages/federation/bin/federation-linux
```

#### Give it permission to execute

```bash
chmod +x federation-linux
```

#### Start it

```bash
./federation-linux
```

If you prefer `javascript` you can download `js` binary but it requires `Nodejs` to be installed on the system

```bash
wget https://github.com/Stradivario/gapi/tree/master/packages/federation/bin/federation-linux.js
```

#### Configuration

Default configuration file is `gateway.config.json`

```json
{
  "port": 4000,
  "serviceList": [
    {
      "name": "projects",
      "url": "http://localhost:9000/graphql"
    }
  ]
}
```

You can specify custom configuration name

```bash
./federation-linux ./gateway.config.json
```

Another option passing configuration is with environment variables

```bash
export GATEWAY_PORT=4000
export GATEWAY_SERVICE_LIST='[{"name":"projects", "url":"http://localhost:9000/graphql"}]'
```

You can install gateway using `npm` and extend it more further

```bash
npm install @gapi/federation @rxdi/core
```

```ts
import { FederationModule } from '@gapi/federation';
import { Bootstrap } from '@rxdi/core';

Bootstrap(
  FederationModule.forRoot({
    port: 4000,
    willSendRequest({ request, context }) {
      request.http.headers.set('authorization', context.headers.authorization);
    },
    serviceList: [
      { name: 'accounts', url: 'http://localhost:9000/graphql' },
      { name: 'products', url: 'http://localhost:9001/graphql' },
    ],
  }),
).subscribe(() => console.log('started'));
```
