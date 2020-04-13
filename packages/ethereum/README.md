# @Gapi Ethereum

#### @Gapi Ethereum module @StrongTyped

##### For questions/issues you can write ticket [here](http://gitlab.youvolio.com/gapi/ethereum/issues)
##### This module is intended to be used with [GAPI](https://github.com/Stradivario/gapi)

## Installation and basic examples:
##### To install this Gapi module, run:

```bash
$ npm install @gapi/ethereum --save
```

## Consuming @gapi/ethereum

### Basic usage
##### Import inside AppModule or CoreModule
```typescript

import { Module } from '@rxdi/core';
import { EthereumModule } from '@gapi/ethereum';

@Module({
    imports: [
        EthereumModule.forRoot({
            port: 8545,
            rpc: 'http://localhost',
        }),
    ]
})
export class CoreModule { }
```

With this simple configuration you are connected to Ethereum Node and you can inject Web3Token and Web3Provider inside your Services, Controllers, Types, etc.
There is a typing provided and tested inside this module [link](https://github.com/Stradivario/gapi-ethereum/blob/master/development/web3.typings.ts)

Web3Token
```typescript
    {
        provide: Web3Token,
        useValue: new Web3(null)
    },
```

Web3ProviderToken
```typescript
    {
        provide: Web3ProviderToken,
        deps: [Web3Token],
        useFactory: (web3: Web3Token) => {
            const provider = new web3.providers.HttpProvider(`${config.rpc}:${config.port}`);
            web3.setProvider(provider);
            return provider;
        }
    },
```

More information you can find [here](https://github.com/Stradivario/gapi-ethereum/blob/master/development/index.ts#L39)

Usage:

```typescript
import { Controller } from '@rxdi/core';
import { Web3Token, Web3ProviderToken } from '@gapi/ethereum';

@Controller() // or @Service()
export class EthereumQueriesController {

    constructor(
        @Inject(Web3Token) private web3: Web3Token,
        @Inject(Web3ProviderToken) private provider: Web3ProviderToken
    ) {
        this.web3;
        this.provider;
    }

}
```

### Advanced usage
####  loading contracts to Gapi Dependency Injection

To Compile Solidity Contracts you can use `truffle`
```bash
$ npm i -g truffle
```

Example Contracts you can find here inside [truffle-metacoin-example](https://github.com/katopz/truffle-metacoin-example)

To compile and migrate your contracts type:

```bash
$ truffle migrate
```

From compiled ABI files *.json you need to install TypeChain compiler to Typescript which will help us to create Methods and classes related with specific contracts that we created

Generate modules using [TypeChain](https://github.com/Neufund/TypeChain)

To install it type:

```bash
$ npm i -g typechain
```

Use it as folow inside Gapi root project folder
```bash
$ typechain --force --outDir src/app/core/contracts './truffle-metacoin-example/build/contracts/*.json'
```

You can use `contracts` parameter inside forRoot configuration to import freshly generated contracts mmm.... smellss like Ethereum :D
```typescript

import { Module } from '@gapi/core';
import { EthereumModule } from '@gapi/ethereum';
import { Coin } from '../core/contracts/Coin';
import { CoinCrowdsale } from '../core/contracts/CoinCrowdsale';

const CoinCrowdsaleABI = require('../../../truffle-metacoin-example/build/contracts/CoinCrowdsale.json');
const CoinABI = require('../../../truffle-metacoin-example/build/contracts/Coin.json');

@Module({
    imports: [
        EthereumModule.forRoot({
            port: process.env.ETHEREUM_PORT || 8545,
            rpc: process.env.ETHEREUM_HOST || 'http://localhost',
            contracts: [
                {
                    contract: Coin,
                    abi: CoinABI
                },
                {
                    contract: CoinCrowdsale,
                    abi: CoinCrowdsaleABI
                }
            ]
        })
    ]
})
export class CoreModule { }
```

Or you can import your contract like raw TypeChain contracts
```typescript
import { Module, ModuleWithServices } from '@gapi/core';
import { Web3Token } from '@gapi/ethereum';
import { Coin } from '../core/contracts/Coin';
import { CoinCrowdsale } from '../core/contracts/CoinCrowdsale';

const CoinCrowdsaleABI = require('../../../truffle-metacoin-example/build/contracts/CoinCrowdsale.json');
const CoinABI = require('../../../truffle-metacoin-example/build/contracts/Coin.json');

@Module()
export class ContractsModule {
    public static forRoot(): ModuleWithServices {
        return {
            gapiModule: ContractsModule,
            services: [
                {
                    provide: Coin,
                    deps: [Web3Token],
                    lazy: true,
                    useFactory: async (web3: Web3Token) => {
                        return await Coin.createAndValidate(web3, CoinABI.networks[Object.keys(CoinABI.networks)[0]].address);
                    }
                },
                {
                    provide: CoinCrowdsale,
                    deps: [Web3Token],
                    lazy: true,
                    useFactory: async (web3: Web3Token) => {
                        return await CoinCrowdsale.createAndValidate(web3, CoinCrowdsaleABI.networks[Object.keys(CoinCrowdsaleABI.networks)[0]].address);
                    }
                }
            ]
        };
    }
}

```

Then import them inside your Core module

```typescript

import { Module } from '@gapi/core';
import { EthereumModule } from '@gapi/ethereum';
import { ContractsModule } from './ethereum/contracts.module';

@Module({
    imports: [
        EthereumModule.forRoot({
            port: process.env.ETHEREUM_PORT || 8545,
            rpc: process.env.ETHEREUM_HOST || 'http://localhost'
        })
        ContractsModule.forRoot()
    ]
})
export class CoreModule { }
```



Then use them inside your controller
```typescript
import {
    Query, GraphQLNonNull, Type,
    Controller, GraphQLInt, Public
} from '@gapi/core';
import { CoinCrowdsale } from '../core/contracts/CoinCrowdsale';

@ObjectType()
export class EthereumCrowdsaleType {
    startTime: number | GraphQLScalarType = GraphQLInt;
    endTime: number | GraphQLScalarType = GraphQLInt;
    hasEnded: boolean | GraphQLScalarType = GraphQLBoolean;
    token: string | GraphQLScalarType = GraphQLString;
    weiRaised: number | GraphQLScalarType = GraphQLInt;
    wallet: string | GraphQLScalarType = GraphQLString;
}


@Controller()
export class EthereumQueriesController {

    constructor(
        private crowdsale: CoinCrowdsale
    ) {}

    @Type(EthereumCrowdsaleType)
    @Public()
    @Query()
    async getCrowdsaleInfo(root, payload, context): Promise<EthereumCrowdsaleType>  {
        const crowdsaleType = {
            startTime: (await this.crowdsale.startTime).toNumber(),
            endTime: (await this.crowdsale.endTime).toNumber(),
            hasEnded: await this.crowdsale.hasEnded,
            token: await this.crowdsale.token,
            weiRaised: (await this.crowdsale.weiRaised).toNumber(),
            wallet: await this.crowdsale.wallet,
        };
        console.log('START TIME: ', crowdsaleType.startTime);
        console.log('END TIME: ', crowdsaleType.endTime);
        console.log('Has Ended: ', crowdsaleType.hasEnded);
        console.log('Token: ', crowdsaleType.token);
        console.log('WeiRaised: ', crowdsaleType.weiRaised);
        console.log('Owner Wallet: ', crowdsaleType.wallet);
        return crowdsaleType;
    }

}

```



Running private blockchain using Ganache with Docker

### Docker

The Simplest way to get started with the Docker image:

```Bash
docker run -d -p 8545:8545 trufflesuite/ganache-cli:latest
```

To pass options to ganache-cli through Docker simply add the arguments to
the run command:

```Bash
docker run -d -p 8545:8545 trufflesuite/ganache-cli:latest -a 10 --debug
```

To build the Docker container from source:

```Bash
git clone https://github.com/trufflesuite/ganache-cli.git && cd ganache-cli
docker build -t trufflesuite/ganache-cli .
```

TODO: Better documentation...

Enjoy ! :)
