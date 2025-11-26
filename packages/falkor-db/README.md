# @gapi/falkordb

#### @Gapi [Falkordb](https://github.com/FalkorDB/falkordb-ts)

##### For questions/issues you can write ticket [here](https://github.com/Stradivario/gapi/issues)

##### This module is intended to be used with [GAPI](https://github.com/Stradivario/gapi)

## Installation and basic examples:

##### To install this Gapi module, run:

```bash
$ npm install @gapi/falkordb
```

## Consuming @gapi/falkordb

##### Import inside AppModule or CoreModule

```typescript
import { Module } from '@rxdi/core';
import { FalkorDBModule } from '@gapi/falkordb';

@Module({
  imports: [
    FalkorDBModule.forRoot({
      username: 'myUsername',
      password: 'myPassword',
      socket: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class CoreModule {}
```
