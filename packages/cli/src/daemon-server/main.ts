import { CoreModule } from '@gapi/core';
import { Container } from '@gapi/core';
import { setup } from '@rxdi/core';
import { switchMap } from 'rxjs/operators';

import { PluginLoader } from './core/services/plugin-loader.service';
import { PluginWatcherService } from './core/services/plugin-watcher.service';
import { ServerModule } from './server.module';

Container.get(PluginLoader)
  .loadPlugins()
  .pipe(
    switchMap((pluginModules) =>
      setup({
        imports: [
          ...pluginModules,
          CoreModule.forRoot({
            server: {
              hapi: {
                port: 42001,
              },
            },
            graphql: {
              graphiql: true,
              openBrowser: true,
              graphiQlPlayground: false,
            },
            // pubsub: {
            //   host: 'localhost',
            //   port: 5672,
            //   log: true,
            //   activateRabbitMQ: true
            // },
            daemon: {
              activated: true,
              link: 'http://localhost:42001/graphql',
            },
          }),
          ServerModule,
        ],
        providers: [PluginWatcherService],
      })
    )
  )
  .subscribe(() => console.log('Server started'), console.error.bind(console));
