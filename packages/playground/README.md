# @Gapi authentication Module

##### For questions/issues you can write ticket [here](http://gitlab.youvolio.com/Stradivario/gapi-auth/issues)
##### This module is intended to be used with [rxdi](https://github.com/rxdi/core) or [gapi](https://github.com/Stradivario/gapi)

## Installation and basic examples:
##### To install this Gapi module, run:

```bash
$ npm install @gapi/auth --save
```

## Consuming @gapi/auth

##### Import inside AppModule or CoreModule
```typescript
import { Module } from "@rxdi/core";
import { AuthModule } from "@gapi/auth";

@Module({
    imports: [
       AuthModule.forRoot({
            algorithm: 'HS256',
            cert: 'dadada',
            cyper: {
                algorithm: 'dada',
                iv: '',
                privateKey: 'dadada'
            }
        }),
    ]
})
export class CoreModule {}
```

##### Create Auth Service and provide it

```typescript

import { Service } from '@rxdi/core';
import * as Boom from 'boom';
import { AuthInterface, AuthInternalService, TokenData } from '@gapi/auth';

export interface UserInfo {
    scope: ['ADMIN', 'USER'];
    type: 'ADMIN' | 'USER';
    iat: number;
}

@Service()
export class AuthService implements AuthInterface {

    constructor(
        private authService: AuthInternalService
    ) { }

    onSubOperation(message, params, webSocket) {
        return params;
    }

    onSubConnection(connectionParams): TokenData {
        if (connectionParams.token) {
            return this.validateToken(connectionParams.token, 'Subscription');
        } else {
            throw Boom.unauthorized();
        }
    }

    validateToken(token: string, requestType: 'Query' | 'Subscription' = 'Query'): any {
        const user = <any>this.authService.verifyToken(token);
        user.type = user.scope[0];
        console.log(`${requestType} from: ${JSON.stringify(user)}`);
        if (user) {
            return user;
        } else {
            throw Boom.unauthorized();
        }
    }

    signJWTtoken(tokenData: TokenData): string {
        return this.authService.sign(tokenData);
    }

    issueJWTToken(tokenData: TokenData) {
        const jwtToken = this.authService.sign({
            email: '',
            id: 1,
            scope: ['ADMIN', 'USER']
        });
        return jwtToken;
    }

    verifyToken(token: string): TokenData {
        return this.authService.verifyToken(token);
    }

    decryptPassword(password: string): string {
        return this.authService.decrypt(password);
    }

    encryptPassword(password: string): string {
        return this.authService.encrypt(password);
    }

}

```

##### Provide this particular Auth Service to `authentication` parameter inside CoreModule.forRoot

```typescript

import { CoreModule, Module } from '@gapi/core';
import { AuthService } from './app/core/services/auth/auth.service';
import { AuthModule } from '@gapi/auth';
import { readFileSync } from 'fs';

@Module({
    imports: [
        AuthModule.forRoot({
            algorithm: 'HS256',
            cert: readFileSync('./cert.key'),
            cyper: {
                algorithm: 'aes256',
                iv: 'Jkyt1H3FA8JK9L3B',
                privateKey: '8zTVzr3p53VC12jHV54rIYu2545x47lA'
            }
        }),
        CoreModule.forRoot({
            pubsub: {
                authentication: AuthService
            },
            graphql: {
                authentication: AuthService
            },
        }),

    ]
})
export class FrameworkImports {}

```

Then Subscriptions, Mutations and Queries will be secured via single authentication method `validateToken` inside `AuthService`!



TODO: Better documentation...

Enjoy ! :)
