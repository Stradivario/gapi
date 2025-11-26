# @Gapi/microservices

![Build Status](https://github.com/Stradivario/gapi/issues)

#### @Gapi Microservices module @StrongTyped

##### For questions/issues you can write ticket [here](https://github.com/Stradivario/gapi/issues)

##### This module is intended to be used with [GAPI](https://github.com/Stradivario/gapi)

## Installation and basic examples:

##### To install this Gapi module, run:

```bash
$ npm install @gapi/microservices --save
```

## Consuming gapi-microservices

##### Import inside AppModule or CoreModule

```typescript
import { GapiModule } from '@gapi/core';
import { GapiMicroserviceModule } from '@gapi/microservices';

@GapiModule({
  imports: [
    GapiMicroserviceModule.forRoot({
      microservice1: 'http://localhost:1000',
      microservice2: 'http://localhost:1000',
    }),
  ],
})
export class AppModule {}
```

TODO: Better documentation...

Enjoy ! :)
