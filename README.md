# @gapi

[![Build Status](https://travis-ci.org/Stradivario/gapi-core.svg?branch=master)](https://travis-ci.org/Stradivario/gapi-core)

**Really easy [GraphQL](https://graphql.org/) API framework build on top of NodeJS inspired by [@Angular](https://angular.io/)**

**Created to provide complex backend scalable applications with minimum effort.**

**For questions/issues you can write ticket [here](http://gitlab.youvolio.com/gapi/gapi/issues)**
<!-- <p align="center"> -->

**Starting project for less than 1 minute via [Gapi-CLI](https://stradivario.github.io/gapi-cli/)**

<!-- <img width="400" style="margin:0 auto;text-align:center" alt="portfolio_view" src="https://raw.githubusercontent.com/Stradivario/gapi-cli-docs/master/src/assets/images/cli-logo.png">
</p> -->
![gapi-cli](https://raw.githubusercontent.com/Stradivario/gapi-cli-docs/master/src/assets/images/cli-logo.png)

***
**Heroku Ready!**

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://github.com/Stradivario/gapi-starter) 

**[Basic starter](https://github.com/Stradivario/gapi-starter) project has Heroku Easy Deploy Button!**


***
**Part of the frameworks and techniques used without which Gapi would not exist :love_letter:**

- [Inversion of control pattern](https://martinfowler.com/articles/injection.html#InversionOfControl)
IOC explanation taken from [this](https://stackoverflow.com/a/6551303) article: 

> IoC Containers are DI frameworks that can work outside of the programming language. In some you can configure which implementations to use in metadata files
> (e.g. XML) which are less invasive. With some you can do IoC that would normally be impossible like inject an implementation at pointcuts.

- [Pointcuts](https://en.wikipedia.org/wiki/Pointcut) - aspect-oriented computer programming
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
- [Typescript](http://www.typescriptlang.org/) [@Decorators](http://www.typescriptlang.org/docs/handbook/decorators.html)

 - [@NodeJS](https://nodejs.org/en/)
 - [@HAPI](https://hapijs.com/)
 - [@ApolloGraphQL](https://www.apollographql.com/)
 - [@Gapi-cli](https://stradivario.github.io/gapi-cli/)
 - [@RXJS](http://reactivex.io/rxjs/)

**Advanced Starter Example and production build**
 - [@Docker](https://www.docker.com/)
 - [@PostgreSQL](https://www.postgresql.org)
 - [@RabbitMQ](http://www.rabbitmq.com/)
***

**Video Tutorials**
##### [Starting tutorial with some explanation](https://www.youtube.com/watch?v=J8WeVfXR_us&feature=youtu.be)
##### [Easy-starter-in-2-mins-installation-with-cli](https://youtu.be/hZdirqZiM5M)
##### [Advanced-starter-in-2-mins-installation-with-cli](https://youtu.be/1zMab64WzfE)
##### [Start gapi a graphql server with Workers advanced(DOCKER)](https://youtu.be/FEDtxkjqXJA)
##### [Start gapi a graphql server with Workers in 2 minutes(DOCKER)](https://www.youtube.com/watch?v=3Td0jj__Ztk)

#### Integrated external modules:

##### [@Gapi-Typescript-Sequelize](https://github.com/Stradivario/gapi-sequelize)
##### [@Gapi-Angular-Client](https://github.com/Stradivario/gapi-angular-client)
##### [@Gapi-Amqp-PubSub](https://github.com/Stradivario/gapi-amqp) (Internally)


## Installation and basic examples:
##### To install this library, run:

```bash
npm install @gapi/core
```

## Simplest Gapi server

```typescript
import {
  GapiObjectType, GraphQLScalarType, GraphQLInt, GraphQLNonNull,
  GapiController, Type, Query, GapiModule, Bootstrap
} from '@gapi/core';

@GapiObjectType()
export class UserType {
    readonly id: number | GraphQLScalarType = GraphQLInt;
}

@GapiController()
export class UserQueriesController {

    @Type(UserType)
    @Query({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    })
    findUser(root, { id }, context): UserType {
        return {id: id};
    }

}

@GapiModule({
    controllers: [
        UserQueriesController
    ]
})
export class AppModule { }

Bootstrap(AppModule);
```

Execute

```bash
ts-node index.ts
```



## With CLI
##### Next create project using CLI or read above how to bootstrap your custom application
## Consuming gapi

##### First we need to install ts-node and nodemon globally
```bash
npm install -g nodemon ts-node
```

##### Next install gapi globally using npm

```bash
npm install @gapi/cli -g
```

##### To skip the following steps creating project and bootstraping from scratch you can type the following command:
It may take 20 seconds because it will install project dependencies.

###### ![Build Status](http://gitlab.youvolio.com/gapi/gapi-starter/badges/master/build.svg)
###### [Basic project](https://github.com/Stradivario/gapi-starter) 
```bash
gapi new my-project
```

###### ![Build Status](http://gitlab.youvolio.com/gapi/gapi-starter-postgres-sequelize/badges/master/build.svg)
###### [Advanced Project](https://github.com/Stradivario/gapi-starter-postgres-sequelize)
```bash
gapi new my-project --advanced
```

Enter inside my-project and type: 

```bash
npm start
```

##### Open browser to 
```bash
http://localhost:9000/graphiql
```


### Testing

###### To start developing with testing GAPI uses JEST and @gapi/cli is preconfigurated for your needs! :)

#### To run single test type:
```bash
gapi test
```

#### Testing watch mode
###### Note: You need to start server before running tests 
###### Note: Everytime you make change to server it will restart server and execute tests
###### Note: To add more tests just create e2e.spec.ts or unit.spec.ts somewhere inside the application

##### Start the application
```bash
gapi start
```
##### Execute test with --watch argument
```bash
gapi test --watch
```
###### You will end up with something like this
 ![Alt Text](https://raw.githubusercontent.com/Stradivario/gapi-cli/master/docs/assets/images/sidebyside.png)


#### Custom logic before testing ( for example creating MOCK users to database before testing)

##### Create file test.ts inside root/src/test.ts with this content
##### Everytime you run test with --before argument it will set environment variable BEFORE_HOOK
```typescript
  if (process.env.BEFORE_HOOK) {
    // do something here
  }
```

##### Then execute tests with --before
```bash
gapi test --before
```
###### This command will start root/src/test.ts file and will wait for process.exit(0) so you can customize your before logic check [this](https://github.com/Stradivario/gapi-starter-postgres-sequelize-rabbitmq/blob/master/src/test.ts#L73) link for reference


##### Unit Testing

```typescript
import { Container } from '@gapi/core';
import { AuthPrivateService } from './auth.service';

const authService: AuthPrivateService = Container.get(AuthPrivateService);

describe('Auth Service', () => {
  it('unit: signJWTtoken => token : Should sucessfully sign jwt', async done => {
        const token = authService.signJWTtoken({
            email: 'dada@abv.bg',
            id: 1,
            scope: ['ADMIN']
        });
        expect(token).toBeTruthy();
        const verifyedToken = authService.verifyToken(token);
        expect(verifyedToken.email).toBe('dada@abv.bg');
        expect(verifyedToken.id).toBe(1);
        expect(verifyedToken.scope[0]).toBe('ADMIN');
        done();
  });
});

```

##### Integrated testing utility inside basic and advanced examples E2E testing
Filepath: `root/src/app/user/user-queries.controller.e2e.spec.ts`
```typescript
import { Container } from '@gapi/core';
import { IQuery } from '../core/api-introspection/index';
import { TestUtil } from '../core/test-util/testing.service';

const testUtil: TestUtil = Container.get(TestUtil);

describe('User Queries Controller', () => {
  it('e2e: queries => (findUser) : Should sucessfully find user', async done => {
    testUtil.sendRequest<IQuery>({
      query: `
        query findUser($id: Int!) {
            findUser(id: $id) {
                id
                settings {
                    username
                    firstname
                }
            }
        }
      `,
      variables: {
        id: 1
      }
    })
      .map(res => {
        expect(res.success).toBeTruthy();
        return res.data.findUser;
      })
      .subscribe(async res => {
        expect(res.id).toBe(1);
        expect(res.settings.username).toBe('o');
        expect(res.settings.firstname).toBe('pesho');
        done();
      }, err => {
        expect(err).toBe(null);
        done();
      });
  });
});

```
Filepath: `root/src/app/core/test-util/testing.service.ts`
```typescript
    disableAuthorization() {
        this.tester = tester({ url: process.env.ENDPOINT_TESTING, contentType: 'application/json' });
    }

    enableAuthorization() {
        this.tester = tester({ url: process.env.ENDPOINT_TESTING, contentType: 'application/json', authorization: process.env.TOKEN_TESTING});
    }

    sendRequest<T>(query: SendRequestQueryType): Observable<Response<T>> {
        if (query.signiture) {
            this.tester = tester({
                url: process.env.ENDPOINT_TESTING,
                contentType: 'application/json',
                authorization: query.signiture.token
            });
        }
        return Observable.fromPromise(this.tester(JSON.stringify(query)));
    }
```


### Docker

###### Following commands will start RabbitMQ, PostgreSQL, API, NGINX as a services and you need DOCKER installed on your system!
###### More information you can find inside project [basic](https://github.com/Stradivario/gapi-starter) or [advanced](https://github.com/Stradivario/gapi-starter-postgres-sequelize-rabbitmq) Documentation 
###### API will be served on https://localhost:80 and https://localhost:80/subscriptions
###### Your custom certificates can be added here "root/nginx/certs/cert.key" "root/nginx/certs/cert.pem"
#### To build project with Docker type:
```bash
gapi app build
```

#### To start project with Docker type:
```bash
gapi app start
```

#### To stop project type:
```bash
gapi app stop
```


### Workers
###### All workers will be mapped as Proxy and will be reverted to https://localhost:80 and https://localhost:80/subscriptions
###### So you don't have to worry about if some of your workers stopped responding
###### Todo: Create monitoring for all workers and main API

#### To start workers type:
```bash
gapi workers start
```

#### To stop workers type:
```bash
gapi workers stop
```



# Creating application from scratch and custom bootstrapping Without CLI

### Create folder structure like this root/src/app


#### Create AppModule like the example above
#### Inject UserModule into imports inside AppModule
### Folder root/src/app/app.module.ts

```typescript

import { GapiModule, GapiServerModule, ConfigService } from '@gapi/core';
import { UserModule } from './user/user.module';

@GapiModule({
    imports: [
        UserModule
    ],
    services: [
        ConfigService.forRoot({
            APP_CONFIG: {
                port: 9000
            }
        })
    ]
})
export class AppModule {}


```

#### Create module UserModule in where we will Inject our created controllers
### Folder root/src/app/user/user.module.ts
```typescript

import { GapiModule } from '@gapi/core';
import { UserQueriesController } from './user.queries.controller';
import { UserMutationsController } from './user.mutations.controller';
import { UserService, AnotherService } from './user/services/user.service';

@GapiModule({
    controllers: [
        UserQueriesController,
        UserMutationsController
    ],
    services: [
        UserService,
        AnotherService
    ]
})
export class UserModule {}
```


#### Define UserType schema
### Folder root/src/user/type/user.type.ts
##### You can customize every resolver from schema and you can create nested schemas with @GapiObjectType decorator


## User Schema
##### Note that you can modify response result via @Resolve('key for modifier defined inside constructor') 
##### Root is the value of previews resolver so for example root.id = '1';
##### When you return some value from @Resolve decorator root.id will be replaced with returned value so it will be 5 in the example
##### If you remove @Resolve decorator it will be passed value returned from the first root resolver

```typescript
import { GraphQLObjectType, GraphQLString, GraphQLInt, InjectType, GapiObjectType, Type, Resolve, GraphQLScalarType } from "gapi";
import { UserSettingsObjectType } from './user-settings.type';

@GapiObjectType()
export class UserType {
    id: number | GraphQLScalarType = GraphQLInt;
    settings: string | UserSettings = InjectType(UserSettingsType);
    
    @Resolve('id')
    getId?(root, payload, context) {
        return 5;
    }
}
```

## UserSettings Schema

```typescript
import { GraphQLObjectType, GraphQLString, GraphQLInt, GapiObjectType, Type, Resolve, GraphQLScalarType } from "gapi";


@GapiObjectType()
export class UserSettings {

    @Injector(AnotherService) private anotherService?: AnotherService;

    readonly username: string | GraphQLScalarType = GraphQLString;
    readonly firstname: string | GraphQLScalarType = GraphQLString;

    @Resolve('username')
    async getUsername?(root, payload, context) {
        return await this.anotherService.trimFirstLetterAsync(root.username);
    }

    @Resolve('firstname')
    getFirstname?(root, payload, context) {
        return 'firstname-changed';
    }

}
```


## UserMessage Schema for Subscriptions

```typescript
import { GapiObjectType, GraphQLScalarType, GraphQLString } from '@gapi/core';

@GapiObjectType()
export class UserMessage {
    readonly message: number | GraphQLScalarType = GraphQLString;
}
```

## UserToken

```typescript
import { GapiObjectType, GraphQLScalarType, GraphQLString, InjectType } from '@gapi/core';
import { UserType } from './user.type';

@GapiObjectType()
export class UserTokenType {
    readonly token: string | GraphQLScalarType = GraphQLString;
    readonly user: UserType = InjectType(UserType);
}
```


## Query
##### Folder root/src/user/query.controller.ts
```typescript
import { Query, GraphQLNonNull, Type, GapiController, GraphQLInt, GraphQLString } from '@gapi/core';
import { UserService } from './services/user.service';
import { UserType } from './types/user.type';
import { UserTokenType } from './types/user-login.type';
import { AuthPrivateService } from '../core/services/auth/auth.service';
import { IUserType, IUserTokenType } from '../core/api-introspection/index';

@GapiController()
export class UserQueriesController {

    constructor(
        private userService: UserService,
        private authService: AuthPrivateService
    ) {}

    @Type(UserType)
    @Query({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    })
    findUser(root, { id }, context): IUserType  {
        return this.userService.findUser(id);
    }

    @Type(UserTokenType)
    @Query({
        email: {
            type: new GraphQLNonNull(GraphQLString)
        },
        password: {
            type: new GraphQLNonNull(GraphQLString)
        }
    })
    login(root, {email, password}, context) {
        let credential: IUserTokenType;

        // Find user from database
        const user = <IUserType>{
            id: 1,
            email: email,
            type: 'ADMIN',
            settings: {
                sidebar: true
            },
            password: this.authService.encryptPassword(password),
            name: 'Test Testov'
        };

        if (this.authService.decryptPassword(user.password) === password) {
            credential = {
                user: user,
                token: this.authService.signJWTtoken({
                    email: user.email,
                    id: user.id,
                    scope: [user.type]
                })
            };
        } else {
            throw new Error('missing-username-or-password');
        }
        return credential;
    }

}

```


## Mutation
##### Folder root/src/user/mutation.controller.ts
```typescript
import { Query, GraphQLNonNull, Scope, Type, GraphQLObjectType, Mutation, GapiController, Service, GraphQLInt, Container, Injector, GapiPubSubService, GraphQLString } from "gapi";
import { UserService } from './services/user.service';
import { UserType } from './types/user.type';
import { UserMessage } from "./types/user-message.type";

@GapiController()
export class UserMutationsController {

    constructor(
        private userService: UserService
        private pubsub: GapiPubSubService
    ) {}

    @Scope('ADMIN')
    @Type(UserType)
    @Mutation({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    })
    deleteUser(root, { id }, context): UserType  {
        return this.userService.deleteUser(id);
    }

    @Scope('ADMIN')
    @Type(UserType)
    @Mutation({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    })
    updateUser(root, { id }, context): UserType {
        return this.userService.updateUser(id);
    }

    @Scope('ADMIN')
    @Type(UserType)
    @Mutation({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    })
    addUser(root, { id }, context): UserType  {
        return this.userService.addUser(id);
    }


    @Scope('ADMIN')
    @Type(UserMessage)
    @Mutation({
        message: {
            type: new GraphQLNonNull(GraphQLString)
        },
        signal: {
            type: new GraphQLNonNull(GraphQLString)
        },
    })
    publishSignal(root, { message, signal }, context): UserMessage  {
        this.pubsub.publish(signal, `Signal Published message: ${message} by ${context.email}`);
        return {message};
    }

}

```

## Subscription
##### Folder root/src/user/user.subscription.controller.ts
```typescript

import {
    GapiObjectType, GraphQLScalarType, GraphQLString, GapiController,
    GapiPubSubService, Type, Injector, Subscribe, Subscription, withFilter, Scope, GraphQLInt, GraphQLNonNull
} from '@gapi/core';
import { UserService } from './services/user.service';
import { UserMessage } from './types/user-message.type';

@GapiController()
export class UserSubscriptionsController {

    @Injector(GapiPubSubService) private static pubsub: GapiPubSubService;

    constructor(
        private userService: UserService
    ) {}

    @Scope('USER')
    @Type(UserMessage)
    @Subscribe(() => UserSubscriptionsController.pubsub.asyncIterator('CREATE_SIGNAL_BASIC'))
    @Subscription()
    subscribeToUserMessagesBasic(message): UserMessage {
        return { message };
    }

    @Scope('ADMIN')
    @Type(UserMessage)
    @Subscribe(
        withFilter(
            () => UserSubscriptionsController.pubsub.asyncIterator('CREATE_SIGNAL_WITH_FILTER'),
            (payload, {id}, context) => {
                console.log('Subscribed User: ', id, JSON.stringify(context));
                return id !== context.id;
            }
        )
    )
    @Subscription({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    })
    subscribeToUserMessagesWithFilter(message): UserMessage {
        return { message };
    }

}


```

##### Example subscription query Basic

```typescript
subscription {
  subscribeToUserMessagesBasic {
    message
  }
}
```

##### Example subscription query WithFilter

```typescript
subscription {
  subscribeToUserMessagesWithFilter(id:1)  {
    message
  }
}
```

## Create Service with @Service decorator somewhere
##### Folder root/src/user/services/user.service.ts
```typescript
import { Service } from "gapi";

@Service()
class AnotherService {
    trimFirstLetter(username: string) {
        return username.charAt(1);
    }

    trimFirstLetterAsync(username): Promise<string> {
        return Promise.resolve(this.trimFirstLetter(username));
    }
}

@Service()
export class UserService {
    constructor(
        private anotherService: AnotherService
    ) {}

    findUser(id: number) {
        return { id: 1 };
    }

    addUser(id: number) {
        const username = this.anotherService.trimFirstLetter('username');
        return { id: 1, username };
    }

    deleteUser(id: number) {
        return { id: 1 };
    }

    updateUser(id) {
        return { id: 1 };
    }

    subscribeToUserUpdates() {
        return { id: 1 };
    }

}
```


## Finally Bootstrap your application
##### Folder root/src/main.ts
```typescript

import { AppModule } from './app/app.module';
import { Bootstrap } from '@gapi/core';

Bootstrap(AppModule);

```


## Start your application using following command inside root folder of the repo
##### Important the script will search main.ts inside root/src/main.ts where we bootstrap our module bellow

```
gapi start
```


## Basic authentication


#### Create Core Module

##### Folder root/src/app/core/core.module.ts

```typescript

import { GapiModule, ConfigService } from '@gapi/core';
import { AuthPrivateService } from './services/auth/auth.service';
import { readFileSync } from 'fs';

@GapiModule({
    services: [
        ConfigService.forRoot({
            APP_CONFIG: {
                port: 9000,
                cert: readFileSync('./cert.key'),
                graphiqlToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImtyaXN0aXFuLnRhY2hldkBnbWFpbC5jb20iLCJpZCI6MSwic2NvcGUiOlsiQURNSU4iXSwiaWF0IjoxNTIwMjkxMzkyfQ.9hpIDPkSiGvjTmUEyg_R_izW-ra2RzzLbe3Uh3IFsZg'
            },
        }),
        AuthPrivateService
    ]
})
export class CoreModule {}

```

#### Create PrivateAuthService @Service() this is complete Subscriptions Query Mutation Authentication via single method "validateToken()"
#### Above there are example methods from GapiAuth module which are provided on air for encrypting and decrypting user password

##### Folder root/src/app/core/services/auth/auth.service

```typescript

import { Service, ConnectionHookService, AuthService, TokenData } from '@gapi/core';
import * as Boom from 'boom';

interface UserInfo extends TokenData {
    scope: ['ADMIN', 'USER'];
    type: 'ADMIN' | 'USER';
}

@Service()
export class AuthPrivateService {

    constructor(
        private authService: AuthService,
        private connectionHookService: ConnectionHookService
    ) {
        this.connectionHookService.modifyHooks.onSubConnection = this.onSubConnection.bind(this);
        this.authService.modifyFunctions.validateToken = this.validateToken.bind(this);
    }

    onSubConnection(connectionParams): UserInfo {
        if (connectionParams.token) {
            return this.validateToken(connectionParams.token, 'Subscription');
        } else {
            throw Boom.unauthorized();
        }
    }

    validateToken(token: string, requestType: 'Query' | 'Subscription' = 'Query'): UserInfo {
        const user = <UserInfo>this.verifyToken(token);
        user.type = user.scope[0];
        console.log(`${requestType} from: ${JSON.stringify(user)}`);
        if (user) {
            return user;
        } else {
            throw Boom.unauthorized();
        }
    }

    verifyToken(token: string): TokenData {
        return this.authService.verifyToken(token);
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

    decryptPassword(password: string): string {
        return this.authService.decrypt(password);
    }

    encryptPassword(password: string): string {
        return this.authService.encrypt(password);
    }

}

```

##### Final import CoreModule inside AppModule

```typescript
import { GapiModule, GapiServerModule } from '@gapi/core';
import { UserModule } from './user/user.module';
import { UserService } from './user/services/user.service';
import { CoreModule } from './core/core.module';

@GapiModule({
    imports: [
        UserModule,
        CoreModule
    ]
})
export class AppModule { }
```



##### Dependency Injection

```typescript

import { GapiModule, InjectionToken } from '@gapi/core';
import { UserModule } from './user/user.module';
import { CoreModule } from './core/core.module';

class UserId {
    id: number;
}

const UserIdToken = new InjectionToken<UserId>('UserId');

@GapiModule({
    imports: [
        UserModule,
        CoreModule
    ],
    services: [
        {
            provide: 'UserId',
            useValue: {id: 1}
        },
        {
            provide: UserIdToken,
            useFactory: () => {
                return {id: 1};
            }
        },
        {
            provide: UserIdToken,
            useClass: UserId
        }
    ]
})
export class AppModule { }
```

```typescript
@GapiController()
export class UserQueriesController {
    constructor(
        @Inject('UserId') private userId: {id: number}, // Value injection
        @Inject(UserIdToken) private userId: UserId, // Token injection
        @Inject(UserIdToken) private userId: UserId, // Class injection
    ) {
        console.log(this.userId.id);
        // Will print 1
    }
}
```


**You can put also Observable as a value**
```typescript
import { GapiModule } from '@gapi/core';
import { UserModule } from './user/user.module';
import { CoreModule } from './core/core.module';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@GapiModule({
    imports: [
        UserModule,
        CoreModule
    ],
    services: [
        {
            provide: 'Observable',
            useValue: new BehaviorSubject(1)
        }
    ]
})
export class AppModule { }
```

**Then inject this service somewhere in your application**

```typescript
import {
    GapiController, GapiPubSubService, Type, Subscribe, Subscription,
    withFilter, Scope, GraphQLInt, GraphQLNonNull, Injector, Inject
} from '@gapi/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@GapiController()
export class UserSubscriptionsController {

    constructor(
        @Inject('Observable') private observable: BehaviorSubject<number>,
        private pubsub: GapiPubSubService
    ) {
        this.observable.subscribe(() => this.pubsub.publish('CREATE_SIGNAL_BASIC', `Signal Published message: ${this.observable.getValue()}`));
    }
}
```

**Then you can put it inside another service and emit values**

```typescript
import { Service, Inject } from '@gapi/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TimerObservable } from 'rxjs/observable/TimerObservable';

@Service()
export class UserService {
    constructor(
        @Inject('Observable') private observable: BehaviorSubject<number>
    ) {
        TimerObservable.create(0, 1000).subscribe((t) => this.observable.next(t))
    }
```

**You can see the subscription when you subscribe to basic chanel inside GraphiQL dev panel**

```typescript
subscription {
  subscribeToUserMessagesBasic {
    message
  }
}
```

**The result will be**
```json
{
  "subscribeToUserMessagesBasic": {
    "message": "Signal Published message: 495"
  }
}
```


##### Complex schema object with nested schemas of same type

```typescript
import { GraphQLObjectType, GraphQLString, GraphQLInt, InjectType, GapiObjectType, Type, Resolve, GraphQLList, GraphQLBoolean } from "gapi";
import { GraphQLScalarType } from "graphql";

@GapiObjectType()
export class UserSettingsType {
    readonly id: number | GraphQLScalarType = GraphQLInt;
    readonly color: string | GraphQLScalarType = GraphQLString;
    readonly language: string | GraphQLScalarType = GraphQLString;
    readonly sidebar: boolean | GraphQLScalarType = GraphQLBoolean;
}

@GapiObjectType()
export class UserWalletSettingsType {
    readonly type: string | GraphQLScalarType = GraphQLString;
    readonly private: string | GraphQLScalarType = GraphQLString;
    readonly security: string | GraphQLScalarType = GraphQLString;
    readonly nested: UserSettingsType = InjectType(UserSettingsType);
    readonly nested2: UserSettingsType = InjectType(UserSettingsType);
    readonly nested3: UserSettingsType = InjectType(UserSettingsType);

    // If you want you can change every value where you want with @Resolve decorator
    @Resolve('type')
    changeType(root, args, context) {
        return root.type + ' new-type';
    }

    // NOTE: you can name function methods as you wish can be Example3 for example important part is to define 'nested3' as a key to map method :)
    @Resolve('nested3')
    Example3(root, args, context) {
        // CHANGE value of object type when returning
        // UserSettingsType {
        //     "id": 1,
        //     "color": "black",
        //     "language": "en-US",
        //     "sidebar": true
        // }
        // root.nested3.id
        // root.nested3.color
        // root.nested3.language
        // root.nested3.sidebar
        return root.nested3;
    }
}


@GapiObjectType()
export class UserWalletType {
    readonly id: number | GraphQLScalarType = GraphQLInt;
    readonly address: string | GraphQLScalarType = GraphQLString;
    readonly settings: string | UserWalletSettingsType = InjectType(UserWalletSettingsType);
}


@GapiObjectType()
export class UserType {
    readonly id: number | GraphQLScalarType = GraphQLInt;
    readonly email: string | GraphQLScalarType = GraphQLString;
    readonly firstname: string | GraphQLScalarType = GraphQLString;
    readonly lastname: string | GraphQLScalarType = GraphQLString;
    readonly settings: string | UserSettingsType = InjectType(UserWalletSettingsType);
    readonly wallets: UserWalletType = new GraphQLList(InjectType(UserWalletType));
}

```



##### When you create such a query from graphiql dev tools

```typescript
query {
  findUser(id:1) {
    id
    email
     firstname
     lastname
    settings {
      id
      color
      language
      sidebar
    }
    wallets {
      id
      address
      settings {
        type
        private
        security
        nested {
          id
          color
          language
          sidebar
        }
        nested2 {
          id
          color
          language
          sidebar
        }
        nested3 {
          id
          color
          language
          sidebar
        }
      }
    }
  }
}

```

##### This query respond to chema above
```typescript

   findUser(id: number): UserType {
        return {
            id: 1,
            email: "kristiqn.tachev@gmail.com",
            firstname: "Kristiyan",
            lastname: "Tachev",
            settings: {
                id: 1,
                color: 'black',
                language: 'en-US',
                sidebar: true
            },
            wallets: [{
                id: 1, address: 'dadadada', settings: {
                    type: "ethereum",
                    private: false,
                    security: "TWO-STEP",
                    nested: {
                        id: 1,
                        color: 'black',
                        language: 'en-US',
                        sidebar: true
                    },
                    nested2: {
                        id: 1,
                        color: 'black',
                        language: 'en-US',
                        sidebar: true
                    },
                    nested3: {
                        id: 1,
                        color: 'black',
                        language: 'en-US',
                        sidebar: true
                    },
                    nested4: {
                        id: 1,
                        color: 'black',
                        language: 'en-US',
                        sidebar: true
                    },
                    
                }
            }]
        };
    }
```


##### The return result from graphql QL will be 

```typescript
{
  "data": {
    "findUser": {
      "id": 1,
      "email": "kristiqn.tachev@gmail.com",
      "firstname": "Kristiyan",
      "lastname": "Tachev",
      "settings": {
        "id": 1,
        "color": "black",
        "language": "en-US",
        "sidebar": true
      },
      "wallets": [
        {
          "id": 1,
          "address": "dadadada",
          "settings": {
            "type": "ethereum new-type",
            "private": "false",
            "security": "TWO-STEP",
            "nested": {
              "id": 1,
              "color": "black",
              "language": "en-US",
              "sidebar": true
            },
            "nested2": {
              "id": 1,
              "color": "black",
              "language": "en-US",
              "sidebar": true
            },
            "nested3": {
              "id": 1,
              "color": "black",
              "language": "en-US",
              "sidebar": true
            }
          }
        }
      ]
    }
  }
}
```



TODO: Better documentation...

Enjoy ! :)
