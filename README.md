# @gapi

[![Build Status](https://travis-ci.org/Stradivario/gapi-core.svg?branch=master)](https://travis-ci.org/Stradivario/gapi-core)

**Really easy [GraphQL](https://graphql.org/) API framework build on top of NodeJS inspired by [@Angular](https://angular.io/)**

**Build with [@rxdi](https://github.com/rxdi/core)** - reactive Extension Dependency Injection Container working inside Browser and Node

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

**Amazon ServerLess Ready!**

[Check Example](#amazon-serverless)

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
##### [@Gapi-Onesignal-Notifications](https://github.com/Stradivario/gapi-onesignal-notifications)
##### [@Gapi-Sequelize](https://github.com/Stradivario/gapi-sequelize)
##### [@Gapi-voyager](https://github.com/Stradivario/gapi-voyager)

## Installation and basic examples:
##### To install this library, run:

```bash
npm install @gapi/core
```

## Simplest Gapi server

```typescript
import { CoreModule } from '@gapi/core';
import { Controller, Module, BootstrapFramework } from '@rxdi/core';
import { GapiObjectType, Query, Type } from '@rxdi/graphql';
import { GraphQLScalarType, GraphQLInt, GraphQLNonNull } from 'graphql';

@GapiObjectType()
export class UserType {
    readonly id: number | GraphQLScalarType = GraphQLInt;
}

@Controller()
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

@Module({
    controllers: [UserQueriesController]
})
export class AppModule { }


BootstrapFramework(AppModule, [CoreModule]).subscribe()
```

Execute

```bash
ts-node index.ts
```
To add configuration click [here](#gapi-configuration)

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

[![Build Status](https://travis-ci.org/Stradivario/gapi-starter.svg?branch=master)](https://travis-ci.org/Stradivario/gapi-starter)
###### [Basic project](https://github.com/Stradivario/gapi-starter) 
```bash
gapi new my-project
```

[![Build Status](https://travis-ci.org/Stradivario/gapi-starter-postgres-sequelize-rabbitmq.svg?branch=master)](https://travis-ci.org/Stradivario/gapi-starter-postgres-sequelize-rabbitmq)
###### [Advanced Project](https://github.com/Stradivario/gapi-starter-postgres-sequelize)
```bash
gapi new my-project --advanced
```

[![Build Status](https://travis-ci.org/Stradivario/gapi-starter-microservices.svg?branch=master)](https://travis-ci.org/Stradivario/gapi-starter-microservices)
###### [Microservices Project](https://github.com/Stradivario/gapi-starter-microservices)
#### To create new basic project with microservices from scratch via CLI type:
```bash
gapi new my-project --microservices
```

[![Build Status](https://travis-ci.org/Stradivario/gapi-starter-serverless.svg?branch=master)](https://travis-ci.org/Stradivario/gapi-starter-serverless)
###### [Serverless Basic Project](https://github.com/Stradivario/gapi-starter-serverless)
#### To create new basic serverless project without ORM from scratch via CLI type:
```bash
gapi new my-project --serverless
```

[![Build Status](https://travis-ci.org/Stradivario/gapi-starter-serverless-sequelize.svg?branch=master)](https://travis-ci.org/Stradivario/gapi-starter-serverless-sequelize)
###### [Serverless Advanced Project](https://github.com/Stradivario/gapi-starter-serverless-sequelize)
#### To create new advanced serverless sequelize project from scratch via CLI type:
```bash
gapi new my-project --serverless-sequelize
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
import { Container } from '@rxdi/core';
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
import { Container } from '@rxdi/core';
import { IQuery } from '../core/api-introspection/index';
import { TestUtil } from '../core/test-util/testing.service';
import { map } from 'rxjs/operators';

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
      .pipe(
        map(res => {
            expect(res.success).toBeTruthy();
            return res.data.findUser;
        })
      )
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
        return from(this.tester(JSON.stringify(query)));
    }
```

### Effects

```typescript
import { Effect } from '@rxdi/core';
import { OfType } from '@rxdi/graphql';
import { EffectTypes } from '../core/api-introspection/EffectTypes';

@Effect()
export class UserEffects {

    @OfType<EffectTypes>(EffectTypes.login)
    findUser(result, payload, context) {
        console.log(result, payload, context);
    }

}
```
How it works ?

When the application starts the whole schema is collected via Decorators applied inside GapiControllers.Now when we have our schema collected and bootstraping is done next step is to attach all BehaviorSubject Observables to particular resolver and from that step we got Type based string literal enums a.k.a Gapi Effects.They look like that:

```typescript

function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}
export const EffectTypes = strEnum(['myevent',
'login',
'subscribeToUserMessagesBasic',
'subscribeToUserMessagesWithFilter',
'destroyUser',
'updateUser',
'addUser',
'publishSignal']);
export type EffectTypes = keyof typeof EffectTypes;

```

Import GapiEffect inside Module

```typescript

import { Module } from '@rxdi/core';
import { UserQueriesController } from './user-queries.controller';
import { UserSubscriptionsController } from './user-subscriptions.controller';
import { UserMutationsController } from './user-mutations.controller';
import { UserService } from './services/user.service';
import { AnotherService } from './services/another.service';
import { UserEffects } from './user.effects';

@Module({
    controllers: [
        UserQueriesController,
        UserSubscriptionsController,
        UserMutationsController
    ],
    services: [
        UserService,
        AnotherService
    ],
    effects: [
        UserEffects
    ]
})
export class UserModule {}
```

If you want to create custom Effect for particular resolver you need to use @EffectName('myevent') Decorator takes String
This decorator will override default event which is Name of the Method in this example will be findUser

```typescript
  @Type(UserType)
  @EffectName('myevent')
  @Query({
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  })
  findUser(root, { id }, context) {
    return {
      id: 1
    };
  }
```

If you click Save app will automatically reload and you will have such a typing inside autogenerated EffectTypes from api-introspection
Then you can lock it with new Typo generated "myevent"
```typescript
  @Type(UserType)
  @EffectName(EffectTypes.myevent)
  @Query({
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  })
  findUser(root, { id }, context) {
    return {
      id: 1
    };
  }
```

Purpose of Effects is to create logic after particular resolver is triggered Successfully without thrown error for example:

- Create Analitics about API usage
- Publish message to RabbitMQ Queue and Consume it in another Funnel or Microservice
- Create After effect for UI/UX for example when user Login you can trigger some Push notification for user.
- etc.


### Hapi Plugins
Working only for version bellow < 1.0.0  will be developed in next weeks

```typescript

import { Module } from '@gapi/core';

@Module({
    plugins: [{
        name: 'myPlugin',
        version: '1.0.0',
        register: async function (server, options) {
            server.route({
                method: 'GET',
                path: '/test',
                handler: function (request, h) {
                    return 'hello, world';
                }
            });
        }
    }]
})
export class AppModule {}


```

How to register plugin to the system.
Difference between Plugin and Service is that system will trigger register method inside constructor if exist,
else it will resolve OnInit and constructor properties.
That way you can register your own plugins to the system after everything is bootstrapped.

```typescript

import { Module, Plugin, Service, PluginInterface } from '@rxdi/core';

@Service()
export class TestService {
  testMethod() {
    return 'Hello world';
  }
}

@Plugin()
export class MyHapiPlugin implements PluginInterface {
  name = 'MyPlugin';
  version = '1.0.0';

  constructor(
    private testService: TestService
  ) {}

  async register(server, options) {
    server.route({
      method: 'GET',
      path: '/test',
      handler: this.handler.bind(this)
    });
  }

  async handler(request, h) {
    return this.testService.helloWorld();
  }

}

@Module({
    plugins: [MyHapiPlugin],
    services: [TestService]
})
export class AppModule {}


```

### ForRoot configuration for modules

```typescript
import { Module, ModuleWithServices, InjectionToken } from '@rxdi/core';

@Service()
export class MODULE_DI_CONFIG {
    text: string = 'Hello world';
}

const MY_MODULE_CONFIG = new InjectionToken<MODULE_DI_CONFIG>('my-module-config');

@Module({
  imports: []
})
export class YourModule {
  public static forRoot(): ModuleWithServices {
    return {
      module: YourModule,
      services: [
          { provide: MY_MODULE_CONFIG, useValue: { text: 'Hello world' } },
          { provide: MY_MODULE_CONFIG, useClass: MODULE_DI_CONFIG },
          { 
            provide: MY_MODULE_CONFIG,
            useFactory: () => {
                return {text: 'Hello world'};
            }
          }
      ]
    }
  }
}
```

(#amazon-serverless)
### Amazon Serverless 
Inside main.ts
```typescript
import { AppModule } from './app/app.module';
import { BootstrapFramework, Container } from '@rxdi/core';
import { FrameworkImports } from './framework-imports';
import { format } from 'url';

const App = BootstrapFramework(AuthMicroserviceModule, [FrameworkImports], { init: true }).toPromise();

export const handler = async (event, context, callback) => {
    const app = await App;
    const url = format({
        pathname: event.path,
        query: event.queryStringParameters
    });
    const options = {
        method: event.httpMethod,
        url,
        payload: event.body,
        headers: event.headers,
        validate: false
    };
    let res = {
        statusCode: 502,
        result: null
    };
    try {
        res = await Container.get<Server>(HAPI_SERVER).inject(options);
    } catch (e) {
        console.error(JSON.stringify(e));
    }
    const headers = Object.assign({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'
    });
    return {
        statusCode: res.statusCode,
        body: res.result,
        headers
    };
};
```

#### Serverless-offline

If we want to use AWS Lambdas Offline we need to set RandomPort to true inside HapiConfig because HAPI will generate random PORT everytime and as far as i know lambas are independent server which will be started everytime when someone execute that particular function.So when running offline it will not say that port 9000 is opened with another server.

```typescript
import { AppModule } from './app/app.module';
import { BootstrapFramework } from '@rxdi/core';
import { CoreModule } from '@gapi/core';

const GapiCoreModule = CoreModule.forRoot({
    server: {
        randomPort: true,
        hapi: {
            port: 9000
        }
    },
    graphql: {
        path: '/graphql',
        openBrowser: false,
        writeEffects: false,
        graphiQlPath: '/graphiql',
        graphiqlOptions: {
            endpointURL: '/graphql',
            subscriptionsEndpoint: `ws://localhost:9000/subscriptions`,
            websocketConnectionParams: {
                token: process.env.GRAPHIQL_TOKEN
            }
        },
        graphqlOptions: {
            schema: null
        }
    },
});
BootstrapFramework(AppModule, [GapiCoreModule], {
    init: false,
    initOptions: {
        effects: true,
        plugins: true,
        services: true,
        controllers: true
    },
    logger: {
        logging: true,
        date: true,
        exitHandler: true,
        fileService: true,
        hashes: true
    }
})
.subscribe(
    () => console.log('Started!'),
    (e) => console.error(e)
);
```

Lambdas cannot use Typescript so we need to compile our application to es6 as commonjs module
```bash
tsc
```

Create serverless.yml
```yml
service: gapi-serverless
provider:
  name: aws
  runtime: nodejs8.10
  stage: development
  profile: default
  region: us-east-2

functions:
  root:
    handler: src/main.handler
    events:
      - http:
          path: "/{proxy+}"
          method: any
          cors: true
          integration: lambda-proxy

plugins:
  - serverless-offline

```

Then we can run
```bash
serverless deploy
```

Later you can create PROXY server and map all existing Lambdas as a single GRAPHQL Schema
```typescript
import { Module } from '@rxdi/core';
import { MicroserviceModule } from '@gapi/microservices';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    CoreModule,
    MicroserviceModule.forRoot([
      {name: 'microservice1', link: 'https://hkzdqnc1i2.execute-api.us-east-2.amazonaws.com/development/graphql'}
    ]),
  ]
})
export class AppModule {}

```


(#gapi-configuration)
## Configuration
> Since 1.0.0 version @gapi micrated to @rxdi there is a little changes which are with Configuration
> @gapi now uses @rxdi/core infrastructure so it is a Framework created on top of it
> This @gapi/core module is wrapper for 3 modules from @rxdi infrastructure: @rxdi/graphql, @rxdi/graphql-pubsub, @rxdi/hapi
> When you install @gapi/core automatically will be installed these 3 modules and inside of @gapi/core module there is a Default configuration for CoreModule which this module exports { CoreModule } example:

```typescript
const DEFAULT_CONFIG = {
    server: {
        hapi: {
            port: 9000
        },
    },
    graphql: {
        path: '/graphql',
        openBrowser: true,
        writeEffects: true,
        graphiql: true,
        graphiQlPlayground: false,
        graphiQlPath: '/graphiql',
        watcherPort: '',
        graphiqlOptions: {
            endpointURL: '/graphql',
            subscriptionsEndpoint: `${
                process.env.GRAPHIQL_WS_SSH ? 'wss' : 'ws'
                }://${process.env.GRAPHIQL_WS_PATH || 'localhost'}${
                process.env.DEPLOY_PLATFORM === 'heroku'
                    ? ''
                    : `:${process.env.API_PORT ||
                    process.env.PORT}`
                }/subscriptions`,
            websocketConnectionParams: {
                token: process.env.GRAPHIQL_TOKEN
            }
        },
        graphqlOptions: {
            schema: null
        }
    },
};
...
```
Full example can be checked [here](https://github.com/Stradivario/gapi-core/blob/master/development/index.ts) 


Based on that change if we want to not use default configuration instead of this
```typescript
BootstrapFramework(AppModule, [CoreModule]).subscribe()
```
We need to add more complex configuration and call it framework-imports where our configuration will live
This module will be imported before AppModule will bootstrap.
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
            server: {
                hapi: {
                    port: process.env.API_PORT || process.env.PORT || 9000
                }
            },
            pubsub: {
                authentication: AuthService
            },
            graphql: {
                path: process.env.GRAPHQL_PATH,
                openBrowser: process.env.OPEN_BROWSER === 'true' ? true : false,
                watcherPort: 8967,
                writeEffects: process.env.WRITE_EFFECTS === 'true' ? true : false,
                graphiql: process.env.GRAPHIQL === 'true' ? true : false,
                graphiQlPlayground: process.env.ENABLE_GRAPHIQL_PLAYGROUND === 'true' ? true : false,
                graphiQlPath: process.env.GRAPHIQL_PATH,
                authentication: AuthService,
                graphiqlOptions: {
                    endpointURL: process.env.GRAPHQL_PATH,
                    passHeader: `'Authorization':'${process.env.GRAPHIQL_TOKEN}'`,
                    subscriptionsEndpoint: `${process.env.GRAPHIQL_WS_SSH ? 'wss' : 'ws'}://${process.env.GRAPHIQL_WS_PATH || 'localhost'}${process.env.DEPLOY_PLATFORM === 'heroku'
                        ? ''
                        : `:${process.env.API_PORT ||
                            process.env.PORT}`}/subscriptions`,
                    websocketConnectionParams: {
                        token: process.env.GRAPHIQL_TOKEN
                    }
                },
                graphqlOptions: {
                    schema: null
                }
            },
        }),

    ]
})
export class FrameworkImports {}

```
Now you can import `FrameworkImports`
```typescript
import { BootstrapFramework } from '@rxdi/core';
import { FrameworkImports } from './framework-imports';
import { AppModule } from './app/app.module';

BootstrapFramework(AppModule, [FrameworkImports]).subscribe()
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
import { Module } from '@rxdi/core';
import { UserModule } from './user/user.module';
import { CoreModule } from './core/core.module';

@Module({
    imports: [
        UserModule,
        CoreModule
    ]
})
export class AppModule { }

```

#### Create module UserModule in where we will Inject our created controllers
### Folder root/src/app/user/user.module.ts
```typescript

import { Module } from '@rxdi/core';
import { UserQueriesController } from './user-queries.controller';
import { UserSubscriptionsController } from './user-subscriptions.controller';
import { UserMutationsController } from './user-mutations.controller';
import { UserService } from './services/user.service';
import { AnotherService } from './services/another.service';
import { UserEffect } from './user.effect';

@Module({
    controllers: [
        UserQueriesController,
        UserSubscriptionsController,
        UserMutationsController
    ],
    services: [
        UserService,
        AnotherService
    ],
    effects: [
        UserEffect
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
import { GapiObjectType, Resolve, InjectType } from '@rxdi/graphql';
import { GraphQLScalarType, GraphQLInt, GraphQLString } from 'graphql';
import { UserSettings } from './user.settings';

@GapiObjectType()
export class UserType {
    readonly id: number | GraphQLScalarType = GraphQLInt;
    readonly email: string | GraphQLScalarType = GraphQLString;
    readonly type: string | GraphQLScalarType =  GraphQLString;
    readonly password: string | GraphQLScalarType =  GraphQLString;
    readonly name: string | GraphQLScalarType =  GraphQLString;
    readonly settings: UserSettings = InjectType(UserSettings);

    @Resolve('id')
    getId?(root, payload, context) {
        return 1;
    }
}
```

## UserSettings Schema

```typescript
import { Injector } from '@rxdi/core';
import { GapiObjectType, Resolve } from '@rxdi/graphql';
import { AnotherService } from '../services/another.service';
import { GraphQLScalarType, GraphQLBoolean } from 'graphql';

@GapiObjectType()
export class UserSettings {

    @Injector(AnotherService) private anotherService?: AnotherService;

    readonly sidebar: boolean | GraphQLScalarType = GraphQLBoolean;

    @Resolve('sidebar')
    async getSidebar?(root, payload, context) {
        return await this.anotherService.returnTrueAsync();
    }

}
```


## UserMessage Schema for Subscriptions

```typescript
import { GapiObjectType } from '@rxdi/graphql';
import { GraphQLScalarType, GraphQLString } from 'graphql';

@GapiObjectType()
export class UserMessage {
    readonly message: string | GraphQLScalarType = GraphQLString;
}
```

## UserToken

```typescript
import { GapiObjectType, InjectType } from '@rxdi/graphql';
import { UserType } from './user.type';
import { GraphQLScalarType, GraphQLString } from 'graphql';

@GapiObjectType()
export class UserTokenType {
    readonly token: string | GraphQLScalarType = GraphQLString;
    readonly user: UserType = InjectType(UserType);
}
```


## Query
##### Folder root/src/user/query.controller.ts
```typescript
import { Controller } from '@rxdi/core';
import { Type, Query, Public } from '@rxdi/graphql';
import { GraphQLNonNull, GraphQLInt, GraphQLString } from 'graphql';
import { UserService } from './services/user.service';
import { UserType } from './types/user.type';
import { UserTokenType } from './types/user-login.type';
import { AuthPrivateService } from '../core/services/auth/auth.service';
import { IUserType, IUserTokenType } from '../core/api-introspection/index';

@Controller()
export class UserQueriesController {

    constructor(
        private userService: UserService,
        private authService: AuthPrivateService
    ) { }

    @Type(UserType)
    @Public()
    @Query({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    })
    findUser(root, { id }, context): IUserType {
        return this.userService.findUser(id);
    }

    @Type(UserTokenType)
    @Public()
    @Query({
        email: {
            type: new GraphQLNonNull(GraphQLString)
        },
        password: {
            type: new GraphQLNonNull(GraphQLString)
        }
    })
    login(root, { email, password }, context) {
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
import { Controller } from '@rxdi/core';
import { UserService } from './services/user.service';
import { UserType } from './types/user.type';
import { UserMessage } from './types/user-message.type';
import { IUserType } from '../core/api-introspection';
import { PubSubService } from '@rxdi/graphql-pubsub';
import { Scope, Type, Mutation, Public } from '@rxdi/graphql';
import { GraphQLNonNull, GraphQLString, GraphQLInt } from 'graphql';

@Controller()
export class UserMutationsController {

    constructor(
        private userService: UserService,
        private pubsub: PubSubService
    ) {}

    @Scope('ADMIN')
    @Type(UserMessage)
    @Public()
    @Mutation({
        message: {
            type: new GraphQLNonNull(GraphQLString)
        },
        signal: {
            type: new GraphQLNonNull(GraphQLString)
        },
    })
    publishSignal(root, { message, signal }, context): UserMessage  {
        console.log(`${signal} Signal Published message: ${message} by ${context.email}`);
        this.pubsub.publish(signal, `${signal} Signal Published message: ${message} by ${context.email}`);
        return {message};
    }

    @Scope('ADMIN')
    @Type(UserType)
    @Mutation({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    })
    deleteUser(root, { id }, context): IUserType  {
        return this.userService.deleteUser(id);
    }

    @Scope('ADMIN')
    @Type(UserType)
    @Mutation({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    })
    updateUser(root, { id }, context): IUserType {
        return this.userService.updateUser(id);
    }

    @Scope('ADMIN')
    @Type(UserType)
    @Mutation({
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    })
    addUser(root, { id }, context): IUserType  {
        return this.userService.addUser(id);
    }

}


```

## Subscription
##### Folder root/src/user/user.subscription.controller.ts
```typescript

import { Controller } from '@rxdi/core';
import { Type, Scope, Public } from '@rxdi/graphql';
import { withFilter } from 'graphql-subscriptions';
import { GraphQLNonNull, GraphQLInt } from 'graphql';
import { PubSubService, Subscribe, Subscription } from '@rxdi/graphql-pubsub';
import { UserMessage } from './types/user-message.type';

@Controller()
export class UserSubscriptionsController {

    constructor(
        private pubsub: PubSubService
    ) {}

    @Scope('ADMIN')
    @Type(UserMessage)
    @Public()
    @Subscribe((self: UserSubscriptionsController) => self.pubsub.asyncIterator('CREATE_SIGNAL_BASIC'))
    @Subscription()
    subscribeToUserMessagesBasic(message): UserMessage {
        return { message };
    }

    @Scope('ADMIN')
    @Type(UserMessage)
    @Subscribe(
        withFilter(
            (self: UserSubscriptionsController) => self.pubsub.asyncIterator('CREATE_SIGNAL_WITH_FILTER'),
            (payload, {id}, context) => {
                console.log('Subscribed User: ', id, JSON.stringify(context));
                return true;
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

import { Service } from '@rxdi/core';
import { IUserType } from '../../core/api-introspection';

@Service()
export class AnotherService {
    trimFirstLetter(username: string): string {
        return username.charAt(1);
    }

    trimFirstLetterAsync(username): Promise<string> {
        return Promise.resolve(this.trimFirstLetter(username));
    }

    returnTrueAsync() {
        return Promise.resolve(true);
    }
}

@Service()
export class UserService {
    constructor(
    ) { }

    findUser(id: number): IUserType {
        return {
            id: 1,
            email: 'test@gmail.com',
            type: 'ADMIN',
            password: '123456',
            name: 'Pesho',
            settings: {
                sidebar: true
            }
        };
    }

    addUser(id: number): IUserType {
        return {
            id: 1,
            email: 'test@gmail.com',
            type: 'ADMIN',
            password: '123456',
            name: 'Pesho',
            settings: {
                sidebar: true
            }
        };
    }

    deleteUser(id: number): IUserType {
        return {
            id: 1,
            email: 'test@gmail.com',
            type: 'ADMIN',
            password: '123456',
            name: 'Pesho',
            settings: {
                sidebar: true
            }
        };
    }

    updateUser(id): IUserType {
        return {
            id: 1,
            email: 'test@gmail.com',
            type: 'ADMIN',
            password: '123456',
            name: 'Pesho',
            settings: {
                sidebar: true
            }
        };
    }

}
```


## Finally Bootstrap your application
##### Folder root/src/main.ts
```typescript
import { AppModule } from './app/app.module';
import { BootstrapFramework } from '@rxdi/core';
import { CoreModule } from '@gapi/core';

BootstrapFramework(AppModule, [CoreModule], {
    init: false,
    initOptions: {
        effects: true,
        plugins: true,
        services: true,
        controllers: true
    },
    logger: {
        logging: true,
        date: true,
        exitHandler: true,
        fileService: true,
        hashes: true
    }
})
.subscribe(
    () => console.log('Started!'),
    (e) => console.error(e)
);
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

import { Module } from '@rxdi/core';
import { AuthPrivateService } from './services/auth/auth.service';

@Module({
    services: [
        AuthPrivateService
    ]
})
export class CoreModule {}
```

#### Create PrivateAuthService @Service() this is complete Subscriptions Query Mutation Authentication via single method "validateToken()"
#### Above there are example methods from GapiAuth module which are provided on air for encrypting and decrypting user password

##### Folder root/src/app/core/services/auth/auth.service

```typescript

import { Service } from '@rxdi/core';
import * as Boom from 'boom';

export interface UserInfo {
    scope: ['ADMIN', 'USER'];
    type: 'ADMIN' | 'USER';
    iat: number;
}

@Service()
export class AuthPrivateService {

    constructor(
        // private authService: AuthService,
        // private connectionHookService: ConnectionHookService
    ) {
        // this.connectionHookService.modifyHooks.onSubConnection = this.onSubConnection.bind(this);
        // this.authService.modifyFunctions.validateToken = this.validateToken.bind(this);
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

    verifyToken(token: string): any {
        // return this.authService.verifyToken(token);
        return token;
    }

    signJWTtoken(tokenData: any): any {
        // return this.authService.sign(tokenData);
        return tokenData;
    }

    issueJWTToken(tokenData: any) {
        // const jwtToken = this.authService.sign({
        //     email: '',
        //     id: 1,
        //     scope: ['ADMIN', 'USER']
        // });
        // return jwtToken;
    }

    decryptPassword(password: string): any {
        // return this.authService.decrypt(password);
        return password;
    }

    encryptPassword(password: string): any {
        // return this.authService.encrypt(password);
        return password;
    }

}

```

##### Final import CoreModule inside AppModule

```typescript
import { Module } from '@rxdi/core';
import { UserModule } from './user/user.module';
import { UserService } from './user/services/user.service';
import { CoreModule } from './core/core.module';

@Module({
    imports: [
        UserModule,
        CoreModule
    ]
})
export class AppModule { }
```



##### Dependency Injection

```typescript

import { Module, InjectionToken } from '@rxdi/core';
import { UserModule } from './user/user.module';
import { CoreModule } from './core/core.module';

class UserId {
    id: number;
}

export const UserIdToken = new InjectionToken<UserId>('UserId');

@Module({
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
@Controller()
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
import { Module } from '@rxdi/core';
import { UserModule } from './user/user.module';
import { CoreModule } from './core/core.module';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Module({
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
import { Controller } from '@rxdi/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PubSubService } from '@rxdi/graphql-pubsub';

@Controller()
export class UserSubscriptionsController {

    constructor(
        @Inject('Observable') private observable: BehaviorSubject<number>,
        private pubsub: PubSubService
    ) {
        this.observable.subscribe(() => this.pubsub.publish('CREATE_SIGNAL_BASIC', `Signal Published message: ${this.observable.getValue()}`));
    }
}
```

**Then you can put it inside another service and emit values**

```typescript
import { Service, Inject } from '@rxdi/core';
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
import { GapiObjectType, InjectType, Resolve, Type } from '@rxdi/graphql';
import { GraphQLGapiObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLBoolean, GraphQLScalarType } from "graphql";

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

### Decorators


All Gapi Decorators

**@Query** - Define Query object added above method inside @Controller

**@Mutation** - Define Mutation object added above method inside @Controller

**@Subscription** - Define Subscription object added above method inside @Controller

**@Subscribe** - It will be used with @Subscription Decorator and it takes PubSubIterator function @Subscribe(() => UserSubscriptionsController.pubsub.asyncIterator('CREATE_SIGNAL_BASIC')) can be used also withFilter 

```typescript
    @Subscribe(
        withFilter(
            (self: UserSubscriptionsController) => self.pubsub.asyncIterator('CREATE_SIGNAL_WITH_FILTER'),
            (payload, {id}, context) => {
                console.log('User trying to subscribe: ', id, JSON.stringify(context));
                // if user passes your expression it will be subscribed to this subscription
                return id !== context.id;
            }
        )
    )
    @Subscription()
    subscribeToUserMessagesWithFilter(message): UserMessage {
        return { message };
    }
```

**@Public** - Works with (@Query, @Mutation, Subscription) adds property "public = true" will make this particular resolver Public without authentication

**@Scope** - Can take arguments like what kind of User can use this Resolver @scope('ADMIN', 'USER', 'SALES')

**@Type** - Works with (@Query, @Mutation, Subscription) passing ObjectType class here for example UserType this is internally new GraphQLObjectType

**@GapiObjectType** - Internally is using new GraphQLObjectType() adding name of the class as a {name: constructor.name} can take {name: 'YourCustomName'} as argument also the same Object type can be used for generating new GraphQLInputObjectType when passing {input: true} used for Arguments

**@Resolve** - This is used internally inside GapiObjectType and it is related with modifying return result from GraphQL like in the following example
```typescript
@GapiObjectType()
export class UserType {
    id: number | GraphQLScalarType = GraphQLInt;
    
    @Resolve('id')
    getId?(root, payload, context) {
        return 5;
    }
}

```
Important part is that getId? method needs to be OPTIONAL because it will be part of the Interface defined by the class UserType so everywhere if you use UserType it will ask you to add getId as a function but we just want to modify the return result from Schema with Resolve method decorator.

**@Controller** - It will define Controllers inside Gapi Application you can have as many as you wish controllers just when you are ready import them inside @Module({controllers: ...CONTROLLERS})


**@Module** - This is the starting point of the application when we bootstrap our module inside root/src/main.ts.Also can be used to create another Modules which can be imported inside AppModule {imports: ...IMPORTS}

**@Service** - Passed above class, this Decorator will insert metadata related with this class and all Dependencies Injected inside constructor() so when application starts you will get a Singleton of many Services if they are not Factory Services(Will explain how to create Factory in next release).So you can use single instance of a Service injected everywhere inside your application.

**@Inject** - It will inject Service with specific NAME for example when using InjectionToken('my-name') you can do something like

```typescript
constructor(
    @Inject('my-name') private name: string;
) {}
```

**@Injector** - Use this very carefully! It will Inject Services before application is fully loaded used to load Instance of a class before the real load of application it is used only inside GapiObjectType because Types are the first thing that will be loaded inside Gapi Application so we need our Services on Processing Decorators which is when the application loads.If you can use Dependency Injection internally provided.

**@InjectType** - This is BETA decorator for now is used without Decorator sign @ example:

```typescript
@GapiObjectType()
export class UserType {
    readonly id: number | GraphQLScalarType = GraphQLInt;
    readonly settings: string | UserSettings = InjectType(UserSettingsType);
}
```
In future releases it will be used as follows: 

```typescript
@GapiObjectType()
export class UserType {
    readonly id: number | GraphQLScalarType = GraphQLInt;
    @InjectType(UserSettingsType) readonly settings: string;
}
```





TODO: Better documentation...

Enjoy ! :)
