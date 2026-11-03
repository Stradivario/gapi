# lambda-site-url - gcli slice

Canonical doc: graphql-server-lambdas `docs/features/lambda-site-url.md`.
`lambda:create` / `lambda:update` print `URL:` and `Site:` through
`printAddresses` (`src/commands/lambda/helpers/index.ts`), with a
best-effort `getLambda(id, ['siteUrl'])`.
