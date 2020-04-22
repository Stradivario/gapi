import {
  CoreModule,
  Module,
  ModuleWithProviders,
} from '@gapi/core';

import { Environment } from './app.constants';

@Module()
export class AppFrameModule {
  public static forRoot(): ModuleWithProviders {
    return {
      module: AppFrameModule,
      frameworkImports: [
        CoreModule.forRoot({
          server: {
            randomPort: !!Environment.RANDOM_PORT,
            hapi: {
              port: Environment.API_PORT,
            },
          },
          graphql: {
            graphiQlPlayground: !!Environment.GRAPHIQL,
            openBrowser: false,
          },
        }),
      ],
    };
  }
}
