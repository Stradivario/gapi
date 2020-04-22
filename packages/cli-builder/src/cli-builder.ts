import {
  GraphqlEnumType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  mergeSchemas,
  Module,
  ModuleWithProviders,
  SCHEMA_OVERRIDE,
} from '@gapi/core';

import { Environment } from './app.constants';
import { AppController } from './app.controller';
import { AppFrameModule } from './app.frame';
import {
  CommandsToken,
  EnumToken,
  MachineStatusQuery,
  Network,
  SubscriptionQuery,
} from './app.tokents';
import { GenericCommandType } from './app.types';
import { CoreModule } from './core/core.moduile';
import {
  executeAction,
  GenericEnum,
} from './core/executors/commands';
import { GraphQLJSON } from './scalar-object';

@Module({
  imports: [AppFrameModule.forRoot(), CoreModule],
})
export class CLIBuilder {
  public static forRoot<C, T = unknown, K = unknown>(
    commands: GenericEnum<C, T, K>,
    enumerables,
    network: Network = new Network()
  ): ModuleWithProviders {
    return {
      module: CLIBuilder,
      providers: [
        {
          provide: CommandsToken,
          useValue: commands,
        },
        {
          provide: EnumToken,
          useValue: enumerables,
        },
        {
          provide: MachineStatusQuery,
          useValue: network.status,
        },
        {
          provide: SubscriptionQuery,
          useValue: network.subscription,
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
                            status: { type: GraphQLString },
                          }),
                        }),
                      },
                    }),
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
                                values: enumerables,
                              })
                            ),
                          },
                          args: {
                            type: GraphQLJSON,
                          },
                          cwd: {
                            type: GraphQLString,
                          },
                        },
                        resolve: (
                          root,
                          {
                            cmd,
                            args,
                            cwd,
                          }: {
                            cmd: string;
                            args: string[];
                            cwd: string;
                          }
                        ) =>
                          executeAction<number, string[]>(
                            cmd
                          )(args, cwd),
                      },
                    }),
                  }),
                }),
              ],
            }),
        },
      ],
      controllers: Environment.SUBSCRIPTION_URI
        ? []
        : [AppController],
    };
  }
}
