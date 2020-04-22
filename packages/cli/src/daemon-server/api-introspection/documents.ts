/* tslint:disable */

export const DOCUMENTS = {
  'gapi-cli-docs/src/app/findUser.query.graphql': {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'query',
        name: { kind: 'Name', value: 'findUser', loc: { start: 6, end: 14 } },
        variableDefinitions: [
          {
            kind: 'VariableDefinition',
            variable: {
              kind: 'Variable',
              name: { kind: 'Name', value: 'id', loc: { start: 16, end: 18 } },
              loc: { start: 15, end: 18 },
            },
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: 'Int',
                  loc: { start: 20, end: 23 },
                },
                loc: { start: 20, end: 23 },
              },
              loc: { start: 20, end: 24 },
            },
            defaultValue: null,
            loc: { start: 15, end: 24 },
          },
        ],
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'findUser',
                loc: { start: 30, end: 38 },
              },
              arguments: [
                {
                  kind: 'Argument',
                  name: {
                    kind: 'Name',
                    value: 'id',
                    loc: { start: 39, end: 41 },
                  },
                  value: {
                    kind: 'Variable',
                    name: {
                      kind: 'Name',
                      value: 'id',
                      loc: { start: 44, end: 46 },
                    },
                    loc: { start: 43, end: 46 },
                  },
                  loc: { start: 39, end: 46 },
                },
              ],
              directives: [],
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  {
                    kind: 'Field',
                    alias: null,
                    name: {
                      kind: 'Name',
                      value: 'id',
                      loc: { start: 54, end: 56 },
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: null,
                    loc: { start: 54, end: 56 },
                  },
                ],
                loc: { start: 48, end: 60 },
              },
              loc: { start: 30, end: 60 },
            },
          ],
          loc: { start: 26, end: 62 },
        },
        loc: { start: 0, end: 62 },
      },
    ],
    loc: { start: 0, end: 63 },
    name: { kind: 'Name', value: 'findUser.query.graphql' },
  },
  'gapi-cli-docs/src/app/publishSignal.mutation.graphql': {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'mutation',
        name: {
          kind: 'Name',
          value: 'publishSignal',
          loc: { start: 9, end: 22 },
        },
        variableDefinitions: [
          {
            kind: 'VariableDefinition',
            variable: {
              kind: 'Variable',
              name: {
                kind: 'Name',
                value: 'message',
                loc: { start: 24, end: 31 },
              },
              loc: { start: 23, end: 31 },
            },
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: 'String',
                  loc: { start: 32, end: 38 },
                },
                loc: { start: 32, end: 38 },
              },
              loc: { start: 32, end: 39 },
            },
            defaultValue: null,
            loc: { start: 23, end: 39 },
          },
          {
            kind: 'VariableDefinition',
            variable: {
              kind: 'Variable',
              name: {
                kind: 'Name',
                value: 'signal',
                loc: { start: 42, end: 48 },
              },
              loc: { start: 41, end: 48 },
            },
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: 'String',
                  loc: { start: 50, end: 56 },
                },
                loc: { start: 50, end: 56 },
              },
              loc: { start: 50, end: 57 },
            },
            defaultValue: null,
            loc: { start: 41, end: 57 },
          },
        ],
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'publishSignal',
                loc: { start: 62, end: 75 },
              },
              arguments: [
                {
                  kind: 'Argument',
                  name: {
                    kind: 'Name',
                    value: 'message',
                    loc: { start: 76, end: 83 },
                  },
                  value: {
                    kind: 'Variable',
                    name: {
                      kind: 'Name',
                      value: 'message',
                      loc: { start: 86, end: 93 },
                    },
                    loc: { start: 85, end: 93 },
                  },
                  loc: { start: 76, end: 93 },
                },
                {
                  kind: 'Argument',
                  name: {
                    kind: 'Name',
                    value: 'signal',
                    loc: { start: 95, end: 101 },
                  },
                  value: {
                    kind: 'Variable',
                    name: {
                      kind: 'Name',
                      value: 'signal',
                      loc: { start: 104, end: 110 },
                    },
                    loc: { start: 103, end: 110 },
                  },
                  loc: { start: 95, end: 110 },
                },
              ],
              directives: [],
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  {
                    kind: 'Field',
                    alias: null,
                    name: {
                      kind: 'Name',
                      value: 'message',
                      loc: { start: 118, end: 125 },
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: null,
                    loc: { start: 118, end: 125 },
                  },
                ],
                loc: { start: 112, end: 129 },
              },
              loc: { start: 62, end: 129 },
            },
          ],
          loc: { start: 58, end: 131 },
        },
        loc: { start: 0, end: 131 },
      },
    ],
    loc: { start: 0, end: 131 },
    name: { kind: 'Name', value: 'publishSignal.mutation.graphql' },
  },
  'gapi-cli-docs/src/app/subscribeToUserMessagesBasic.subscription.graphql': {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'subscription',
        name: {
          kind: 'Name',
          value: 'subscribeToUserMessagesBasic',
          loc: { start: 13, end: 41 },
        },
        variableDefinitions: [],
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'subscribeToUserMessagesBasic',
                loc: { start: 46, end: 74 },
              },
              arguments: [],
              directives: [],
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  {
                    kind: 'Field',
                    alias: null,
                    name: {
                      kind: 'Name',
                      value: 'message',
                      loc: { start: 81, end: 88 },
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: null,
                    loc: { start: 81, end: 88 },
                  },
                ],
                loc: { start: 75, end: 92 },
              },
              loc: { start: 46, end: 92 },
            },
          ],
          loc: { start: 42, end: 94 },
        },
        loc: { start: 0, end: 94 },
      },
    ],
    loc: { start: 0, end: 94 },
    name: {
      kind: 'Name',
      value: 'subscribeToUserMessagesBasic.subscription.graphql',
    },
  },
  'node_modules/graphql-document-collector/example/fragments/onFilm/Movie.graphql': {
    kind: 'Document',
    definitions: [
      {
        kind: 'FragmentDefinition',
        name: { kind: 'Name', value: 'Movie', loc: { start: 9, end: 14 } },
        typeCondition: {
          kind: 'NamedType',
          name: { kind: 'Name', value: 'Film', loc: { start: 18, end: 22 } },
          loc: { start: 18, end: 22 },
        },
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              alias: null,
              name: { kind: 'Name', value: 'id', loc: { start: 27, end: 29 } },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 27, end: 29 },
            },
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'title',
                loc: { start: 32, end: 37 },
              },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 32, end: 37 },
            },
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'director',
                loc: { start: 40, end: 48 },
              },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 40, end: 48 },
            },
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'planetConnection',
                loc: { start: 51, end: 67 },
              },
              arguments: [],
              directives: [],
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  {
                    kind: 'Field',
                    alias: null,
                    name: {
                      kind: 'Name',
                      value: 'planets',
                      loc: { start: 74, end: 81 },
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: {
                      kind: 'SelectionSet',
                      selections: [
                        {
                          kind: 'FragmentSpread',
                          name: {
                            kind: 'Name',
                            value: 'Place',
                            loc: { start: 93, end: 98 },
                          },
                          directives: [],
                          loc: { start: 90, end: 98 },
                        },
                      ],
                      loc: { start: 82, end: 104 },
                    },
                    loc: { start: 74, end: 104 },
                  },
                ],
                loc: { start: 68, end: 108 },
              },
              loc: { start: 51, end: 108 },
            },
          ],
          loc: { start: 23, end: 110 },
        },
        loc: { start: 0, end: 110 },
      },
      {
        kind: 'FragmentDefinition',
        name: { kind: 'Name', value: 'Place', loc: { start: 9, end: 14 } },
        typeCondition: {
          kind: 'NamedType',
          name: { kind: 'Name', value: 'Planet', loc: { start: 18, end: 24 } },
          loc: { start: 18, end: 24 },
        },
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'name',
                loc: { start: 29, end: 33 },
              },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 29, end: 33 },
            },
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'climates',
                loc: { start: 36, end: 44 },
              },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 36, end: 44 },
            },
          ],
          loc: { start: 25, end: 46 },
        },
        loc: { start: 0, end: 46 },
      },
    ],
    loc: { start: 0, end: 111 },
    name: { kind: 'Name', value: 'Movie.graphql' },
  },
  'node_modules/graphql-document-collector/example/fragments/onPlanet/Place.graphql': {
    kind: 'Document',
    definitions: [
      {
        kind: 'FragmentDefinition',
        name: { kind: 'Name', value: 'Place', loc: { start: 9, end: 14 } },
        typeCondition: {
          kind: 'NamedType',
          name: { kind: 'Name', value: 'Planet', loc: { start: 18, end: 24 } },
          loc: { start: 18, end: 24 },
        },
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'name',
                loc: { start: 29, end: 33 },
              },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 29, end: 33 },
            },
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'climates',
                loc: { start: 36, end: 44 },
              },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 36, end: 44 },
            },
          ],
          loc: { start: 25, end: 46 },
        },
        loc: { start: 0, end: 46 },
      },
    ],
    loc: { start: 0, end: 47 },
    name: { kind: 'Name', value: 'Place.graphql' },
  },
  'node_modules/graphql-document-collector/example/queries/ListMovies.graphql': {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'query',
        name: { kind: 'Name', value: 'ListMovies', loc: { start: 6, end: 16 } },
        variableDefinitions: [],
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'allFilms',
                loc: { start: 21, end: 29 },
              },
              arguments: [],
              directives: [],
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  {
                    kind: 'Field',
                    alias: null,
                    name: {
                      kind: 'Name',
                      value: 'films',
                      loc: { start: 36, end: 41 },
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: {
                      kind: 'SelectionSet',
                      selections: [
                        {
                          kind: 'FragmentSpread',
                          name: {
                            kind: 'Name',
                            value: 'Movie',
                            loc: { start: 53, end: 58 },
                          },
                          directives: [],
                          loc: { start: 50, end: 58 },
                        },
                      ],
                      loc: { start: 42, end: 64 },
                    },
                    loc: { start: 36, end: 64 },
                  },
                ],
                loc: { start: 30, end: 68 },
              },
              loc: { start: 21, end: 68 },
            },
          ],
          loc: { start: 17, end: 70 },
        },
        loc: { start: 0, end: 70 },
      },
      {
        kind: 'FragmentDefinition',
        name: { kind: 'Name', value: 'Movie', loc: { start: 9, end: 14 } },
        typeCondition: {
          kind: 'NamedType',
          name: { kind: 'Name', value: 'Film', loc: { start: 18, end: 22 } },
          loc: { start: 18, end: 22 },
        },
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              alias: null,
              name: { kind: 'Name', value: 'id', loc: { start: 27, end: 29 } },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 27, end: 29 },
            },
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'title',
                loc: { start: 32, end: 37 },
              },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 32, end: 37 },
            },
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'director',
                loc: { start: 40, end: 48 },
              },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 40, end: 48 },
            },
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'planetConnection',
                loc: { start: 51, end: 67 },
              },
              arguments: [],
              directives: [],
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  {
                    kind: 'Field',
                    alias: null,
                    name: {
                      kind: 'Name',
                      value: 'planets',
                      loc: { start: 74, end: 81 },
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: {
                      kind: 'SelectionSet',
                      selections: [
                        {
                          kind: 'FragmentSpread',
                          name: {
                            kind: 'Name',
                            value: 'Place',
                            loc: { start: 93, end: 98 },
                          },
                          directives: [],
                          loc: { start: 90, end: 98 },
                        },
                      ],
                      loc: { start: 82, end: 104 },
                    },
                    loc: { start: 74, end: 104 },
                  },
                ],
                loc: { start: 68, end: 108 },
              },
              loc: { start: 51, end: 108 },
            },
          ],
          loc: { start: 23, end: 110 },
        },
        loc: { start: 0, end: 110 },
      },
      {
        kind: 'FragmentDefinition',
        name: { kind: 'Name', value: 'Place', loc: { start: 9, end: 14 } },
        typeCondition: {
          kind: 'NamedType',
          name: { kind: 'Name', value: 'Planet', loc: { start: 18, end: 24 } },
          loc: { start: 18, end: 24 },
        },
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'name',
                loc: { start: 29, end: 33 },
              },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 29, end: 33 },
            },
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'climates',
                loc: { start: 36, end: 44 },
              },
              arguments: [],
              directives: [],
              selectionSet: null,
              loc: { start: 36, end: 44 },
            },
          ],
          loc: { start: 25, end: 46 },
        },
        loc: { start: 0, end: 46 },
      },
    ],
    loc: { start: 0, end: 71 },
    name: { kind: 'Name', value: 'ListMovies.graphql' },
  },
  'src/core/services/daemon-executor/queries/getLinkList.query.graphql': {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'query',
        name: {
          kind: 'Name',
          value: 'getLinkList',
          loc: { start: 6, end: 17 },
        },
        variableDefinitions: [],
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              alias: null,
              name: {
                kind: 'Name',
                value: 'getLinkList',
                loc: { start: 22, end: 33 },
              },
              arguments: [],
              directives: [],
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  {
                    kind: 'Field',
                    alias: null,
                    name: {
                      kind: 'Name',
                      value: 'repoPath',
                      loc: { start: 40, end: 48 },
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: null,
                    loc: { start: 40, end: 48 },
                  },
                  {
                    kind: 'Field',
                    alias: null,
                    name: {
                      kind: 'Name',
                      value: 'introspectionPath',
                      loc: { start: 53, end: 70 },
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: null,
                    loc: { start: 53, end: 70 },
                  },
                  {
                    kind: 'Field',
                    alias: null,
                    name: {
                      kind: 'Name',
                      value: 'linkName',
                      loc: { start: 75, end: 83 },
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: null,
                    loc: { start: 75, end: 83 },
                  },
                ],
                loc: { start: 34, end: 87 },
              },
              loc: { start: 22, end: 87 },
            },
          ],
          loc: { start: 18, end: 89 },
        },
        loc: { start: 0, end: 89 },
      },
    ],
    loc: { start: 0, end: 90 },
    name: { kind: 'Name', value: 'getLinkList.query.graphql' },
  },
};
