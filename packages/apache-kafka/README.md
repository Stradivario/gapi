# @Gapi Kafka Module

![Build Status](http://gitlab.youvolio.com/gapi/gapi/badges/branch/build.svg)

#### @Gapi Kafka module

##### For questions/issues you can write ticket [here](http://gitlab.youvolio.com/gapi/gapi-apache-kafka/issues)
##### This module is intended to be used with [GAPI](https://github.com/Stradivario/gapi)

## Installation and basic examples:
##### To install this Gapi module, run:

```bash
$ npm install Stradivario/gapi-apache-kafka --save
```

## Consuming gapi-apache-kafka

MAINTENANCE NEEDED!! Not updated to version 1.0.0!

##### Import inside AppModule or CoreModule
```typescript

import { Module } from 'gapi';
import { KafkaModule } from 'gapi-apache-kafka';

@Module({
    imports: [
        KafkaModule.forRoot({
                host: '182.10.0.5',
                port: 9092
            })
    ]
})
export class CoreModule { }
```

TODO: Better documentation...

Enjoy ! :)
