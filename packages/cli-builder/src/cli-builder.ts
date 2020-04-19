import {
  DocumentNode,
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
import { gql } from 'apollo-server-core';

import { Environment } from './app.constants';
import { AppController } from './app.controller';
import { AppFrameModule } from './app.frame';
import {
  CommandsToken,
  EnumToken,
  MachineStatusQuery,
  SubscriptionQuery
} from './app.tokents';
import { GenericCommandType } from './app.types';
import { CoreModule } from './core/core.moduile';
import {
  executeAction,
  GenericEnum
} from './core/executors/commands';

@Module({
  imports: [AppFrameModule.forRoot(), CoreModule]
})
export class CLIBuilder {
  public static forRoot<C, T = unknown, K = unknown>(
    commands: GenericEnum<C, T, K>,
    enumerables,
    subscriptionQuery?: DocumentNode,
    machineStatusQuery?: DocumentNode
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
          provide: MachineStatusQuery,
          useValue:
            machineStatusQuery ||
            gql`
              mutation notifyMachineResult(
                $machineHash: String!
                $data: String!
                $error: String
              ) {
                notifyMachineResult(
                  machineHash: $machineHash
                  data: $data
                  error: $error
                ) {
                  status
                }
              }
            `
        },
        {
          provide: SubscriptionQuery,
          useValue:
            subscriptionQuery ||
            gql`
              subscription($machineHash: String!) {
                registerWorker(machineHash: $machineHash) {
                  command
                  args
                  cwd
                }
              }
            `
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
