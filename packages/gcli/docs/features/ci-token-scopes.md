# ci-token-scopes (gcli slice)

**Canonical doc:** `graphql-server/docs/features/ci-token-scopes.md` ·
**Since:** 2026-10-19

gcli itself enforces nothing - a CI/CD token (`gcli login --ci --token …`)
is checked by the services. What this package owns:

- Every project command maps to one permission (README → CI/CD
  Integration has the table). A refused command prints the service error
  `ci-token-missing-scope: <operation> needs <scope>` /
  `ci-token-lambda-not-allowed` / `ci-token-wrong-project`.
- `mq-trigger:list/create/update/delete`
  (`src/commands/triggers/message-queue/`, `GraphqlClienAPI.
  listMessageQueueTriggers / saveMessageQueueTrigger / deleteMessageQueueTrigger`)
  - the `mq-trigger:*` permissions had no CLI before. `update` reads the
  current trigger and sends it with the given flags on top
  (`mergeOverExisting`): the service hands the payload to Fission as the
  whole spec and picks the cluster by `lambdaName`, so a partial payload
  would drop settings. Counts are validated as whole numbers
  (`toTriggerInput`). The trigger types are declared in `gql-client.ts`
  (not in the bundled introspection yet).
- Not for CI tokens: `runner:*`, `project:list`, `mcp:start`.

**Test:** `npx jest test/mq-trigger.spec.ts`.
