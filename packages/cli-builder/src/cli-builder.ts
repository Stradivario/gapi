import {
  // Controller,
  // GraphQLControllerOptions,
  GraphqlEnumType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  mergeSchemas,
  Module,
  ModuleWithProviders,
  SCHEMA_OVERRIDE
} from '@gapi/core';

import { Environment } from './app.constants';
import { AppController } from './app.controller';
import { AppFrameModule } from './app.frame';
import { CommandsToken, EnumToken } from './app.tokents';
import { GenericCommandType } from './app.types';
import { CoreModule } from './core/core.moduile';
import { executeAction } from './core/executors/commands';

@Module({
  imports: [AppFrameModule.forRoot(), CoreModule]
})
export class CLIBuilder {
  public static forRoot<T>(
    commands: T,
    enumerables
  ): ModuleWithProviders {
    return {
      module: CLIBuilder,
      providers: [
        {
          provide: CommandsToken,
          useValue: commands
        },
        {
          provide: EnumToken,
          useValue: enumerables
        },
        {
          provide: SCHEMA_OVERRIDE,
          useFactory: () => (schema: GraphQLSchema) =>
            mergeSchemas({
              schemas: [
                schema,
                new GraphQLSchema({
                  query: new GraphQLObjectType({
                    name: 'Query',
                    fields: () => ({
                      status: {
                        type: new GraphQLObjectType({
                          name: 'StatusQueryType',
                          fields: () => ({
                            status: { type: GraphQLString }
                          })
                        })
                      }
                    })
                  }),
                  mutation: new GraphQLObjectType({
                    name: 'Mutation',
                    fields: () => ({
                      execute: {
                        type: GenericCommandType,
                        args: {
                          cmd: {
                            type: new GraphQLNonNull(
                              new GraphqlEnumType({
                                name: 'Commands',
                                values: enumerables
                              })
                            )
                          },
                          args: {
                            type: new GraphQLList(
                              GraphQLString
                            )
                          },
                          cwd: {
                            type: GraphQLString
                          }
                        },
                        resolve: (
                          root,
                          {
                            cmd,
                            args,
                            cwd
                          }: {
                            cmd: string;
                            args: string[];
                            cwd: string;
                          }
                        ) =>
                          executeAction<number, string[]>(
                            cmd
                          )(args, cwd)
                      }
                    })
                  })
                })
              ]
            })
        }
      ],
      controllers: Environment.SUBSCRIPTION_URI
        ? []
        : [AppController]
    };
  }
}
