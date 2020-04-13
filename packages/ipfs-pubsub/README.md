# @Gapi Ipfs InterPlanetary File System Pub Sub Module (Beta)

##### More information about IPFS system can be find here [IPFS-WIKI](https://en.wikipedia.org/wiki/InterPlanetary_File_System)
##### For questions/issues you can write ticket [here](http://gitlab.youvolio.com/gapi/gapi-ipfs-pubsub/issues)
##### This module is intended to be used with [Gapi](https://github.com/Stradivario/Gapi) or [rxdi](https://github.com/rxdi)

@gapi/ipfs hello world ipfs address:

https://ipfs.io/ipfs/QmPhYdx4dB6TwBU1KEbYmyET7HQJoLpyERvRD4kMWv3B3a

## Installation and basic examples:
##### To install this  module, run:

```bash
$ npm install @gapi/ipfs-pubsub --save
```

## Consuming @gapi/ipfs-pubsub
##### Import inside AppModule or CoreModule

```typescript

import { Module, Service } from '@rxdi/core';
import { IpfsPubSubModule, IpfsPubSubRoom } from '@gapi/ipfs-pubsub';


@Module({
    imports: [
        IpfsPubSubModule.forRoot({
            rooms: [
                { topic: 'test-topic'},
                { topic: 'test-topic2'},
                { topic: 'test-topic3'},
            ],
            logging: true
        }),
    ]
})
export class CoreModule { }

```


TODO: Later releases
```typescript
import { Module, Service } from '@rxdi/core';
import { IpfsPubSubModule, IpfsPubSubRoom } from '@gapi/ipfs-pubsub';

@Service()
export class TestRoom implements IpfsPubSubRoom {
    name?: string = 'TestRoom'; // optional if not provided it will take class name as topic

    constructor(
        @Inject(OrbitDb) private orbitdb: Promise<OrbitDb>
        @Inject(IpfsPubSubRoom) private ipfsPubSubRoom: IpfsPubSubRoom
        @Inject(IPFS) private ipfs: IPFS
    ) {

    }
}

@Module({
    imports: [
        IpfsPubSubModule.forRoot({
            rooms: [TestRoom],
            logging: true
        }),
    ]
})
export class CoreModule { }

```

TODO: Better documentation...

Enjoy ! :)

