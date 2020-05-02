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
            randomPort: !!Environment.GRAPHQL_RUNNER_RANDOM_PORT,
            hapi: {
              port: Environment.GRAPHQL_RUNNER_API_PORT,
            },
          },
          graphql: {
            graphiQlPlayground: !!Environment.GRAPHQL_RUNNER_GRAPHIQL,
            openBrowser: false,
          },
        }),
      ],
    };
  }
}
