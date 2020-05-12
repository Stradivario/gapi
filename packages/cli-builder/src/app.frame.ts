import {
  Boom,
  CoreModule,
  Module,
  ModuleWithProviders,
  ON_REQUEST_HANDLER,
} from '@gapi/core';

import { Environment } from './app.constants';

@Module()
export class AppFrameModule {
  public static forRoot(): ModuleWithProviders {
    return {
      module: AppFrameModule,
      providers: [
        {
          provide: ON_REQUEST_HANDLER,
          useFactory: () => async (next, request) => {
            if (
              Environment.GRAPHQL_RUNNER_SECRET &&
              request.headers.authorization !==
                Environment.GRAPHQL_RUNNER_SECRET
            ) {
              return Boom.unauthorized();
            }
            return next();
          },
        },
      ],
      frameworkImports: [
        CoreModule.forRoot({
          server: {
            randomPort: !!Environment.GRAPHQL_RUNNER_RANDOM_PORT,
            hapi: {
              port: Environment.GRAPHQL_RUNNER_API_PORT,
            },
          },
          graphql: {
            initQuery: false,
            graphiQlPlayground: !!Environment.GRAPHQL_RUNNER_GRAPHIQL,
            openBrowser: false,
          },
        }),
      ],
    };
  }
}
