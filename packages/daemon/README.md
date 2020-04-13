## Daemon
> Helps with productivity

> Automatically apply schema introspection changes from graphql API to specific folders

> The schema is introspected only when the API is successfully started

> When API changes his `schema` the client should know about it

> When You have multiple clients (mobile, desktop, web) you want to sync them according to your API Graphql Schema

To use daemon you need to activate it inside your `@gapi/core` => `CoreModule` configuration

```typescript
const DEFAULT_CONFIG = {
    server: {},
    graphql: {},
    daemon: { activated: true }
};
```

```typescript
import { BootstrapFramework } from '@rxdi/core';
import { AppModule } from './app/app.module';
import { CoreModule, Module } from '@gapi/core';

@Module({
    imports: [
        CoreModule.forRoot({
            server: {},
            pubsub: {},
            graphql: {},
            daemon: { activated: true }
        }),

    ]
})
export class FrameworkImports {}

BootstrapFramework(AppModule, [FrameworkImports]).subscribe()

```

#### Starting daemon
```bash
gapi daemon start
```

#### Stopping daemon
```bash
gapi daemon stop
```

#### Cleaning daemon cache folder `~/.gapi/daemon`
```bash
gapi daemon clean
```


#### Link project
```bash
gapi daemon link your-link-name
```


#### Unlink project

```bash
gapi daemon unlink
```

#### Unlink all projects

```bash
gapi daemon unlink --all
```

# Flow


1. Start the API
2. Execute `gapi daemon link your-link-name`
3. Go to client project folder
4. Execute `gapi daemon link your-link-name`
5. Made change to the graphql schema on the API
6. You will see that client introspection changed also without writing single line of code

If you wish to link more than one project just execute command inside other folder

```bash
gapi daemon link your-link-name
```

# IMPORTANT

### `gapi-cli.conf.yml` will be created if not present since daemon will trigger command using configuration from it.

```bash
gapi schema introspect --collect-documents --collect-types
```
Read [more](https://github.com/Stradivario/gapi-cli/wiki/schema) about `schema introspect` 

```yml
config:
  schema:
    introspectionEndpoint: http://localhost:9000/graphql
    introspectionOutputFolder: ./src/server/api-introspection
```

Replace with the desired configuration


# Custom plugins

Gapi daemon has capability to load external plugins via IPFS network or using regular @gapi module example module can be found [HERE](https://github.com/Stradivario/gapi-daemon-example-plugin)

A simple plugin looks like regular `@rxdi`/`@gapi` module basically every module inside this architecture can be used as a daemon plugin.

```typescript
import { Module } from '@gapi/core';
import { MainService } from './services/main.service';
import { CustomControllerController } from './custom-controller/custom-controller.controller';

@Module({
    providers: [MainService],
    controllers: [CustomControllerController]
})
export class AppModule {}
```

You can add also plugins via IPFS https://ipfs.io/ipfs/QmY74wyqeeHYVtEkChvbQypxeZd43rk77hY8yfaU16fZQ4 this is `@rxdi/deploy` plugin module can be found here https://ipfs.io/ipfs/QmYtvfC5cXutnH6y7nK8eGnPcAkU75DpngR3vGDk9A9KQt

```
gapi plugin add QmY74wyqeeHYVtEkChvbQypxeZd43rk77hY8yfaU16fZQ4
```

Remove
```
gapi plugin remove QmY74wyqeeHYVtEkChvbQypxeZd43rk77hY8yfaU16fZQ4
```