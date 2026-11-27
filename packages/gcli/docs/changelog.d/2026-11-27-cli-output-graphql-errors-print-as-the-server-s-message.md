## 2026-11-27 - cli-output: GraphQL errors print as the server's message

**Feature:** cli-output · **Type:** feat

- GraphQL errors from the API print as the server's messages (one line each) instead of the raw JSON list: `GraphQLRequestError` (gql-client.ts) keeps the list on `errors`; `GCLI_DEBUG=1` prints it.
- **Test:** `npx jest --coverage=false test/graphql-errors.spec.ts`.
- **Debug:** `GCLI_DEBUG=1 gcli ...` shows paths, codes and the downstream query.
- **Verification:** 281 tests; `plugin:resources -p not-a-project-id` prints '✖ not-valid-id'.
