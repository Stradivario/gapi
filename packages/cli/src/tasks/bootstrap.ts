import { CoreModule, CoreModuleConfig } from '@gapi/core';
import { Service, setup } from '@rxdi/core';
import { switchMap } from 'rxjs/operators';

import { nextOrDefault } from '../core/helpers';
import { PluginLoader } from '../daemon-server/core/services/plugin-loader.service';
import { PluginWatcherService } from '../daemon-server/core/services/plugin-watcher.service';
import { ServerModule } from '../daemon-server/server.module';

@Service()
export class BootstrapTask {
  constructor(private pluginLoader: PluginLoader) {}
  async run(options?: CoreModuleConfig) {
    this.pluginLoader
      .loadPlugins()
      .pipe(
        switchMap((pluginModules) =>
          setup({
            imports: [
              ...pluginModules,
              CoreModule.forRoot(
                options || {
                  server: {
                    hapi: {
                      port: nextOrDefault('--port', 42000, (p) => Number(p)),
                    },
                  },
                  graphql: {
                    openBrowser: false,
                    graphiql: false,
                    graphiQlPlayground: false,
                  },
                  // pubsub: {
                  //   host: 'localhost',
                  //   port: 5672,
                  //   log: true,
                  //   activateRabbitMQ: true
                  // },
                  // daemon: {
                  //   activated: true,
                  //   link: 'http://localhost:42001/graphql'
                  // }
                }
              ),
              ServerModule,
            ],
            providers: [PluginWatcherService],
          })
        )
      )
      .subscribe(
        () => console.log('Daemon started'),
        console.error.bind(console)
      );
  }
}
