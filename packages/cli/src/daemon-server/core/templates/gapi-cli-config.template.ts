export const GAPI_CLI_CONFIG_TEMPLATE = (port: number) => `
config:
  schema:
    introspectionEndpoint: http://localhost:${port}/graphql
    introspectionOutputFolder: ./api-introspection
`;
