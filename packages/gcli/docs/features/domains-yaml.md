# domains-yaml

**Status:** built 2026-11-21 (feature customer-domains, graphql-server plans
43 + 44; canonical feature doc in graphql-server-lambdas
`docs/features/customer-domains.md`).

## What it is

- `domains:` in `lambforge.yaml` (`DomainConfig` in
  `src/commands/lambda/helpers/load-spec.ts`): entries with `name` (a
  platform name, `<name>.lambforge.app`) or `host` (a custom domain), `serves`
  (a lambda name / `all` / `full-path`, default the file's `function.name`)
  and `paths` (prefix -> lambda name).
- `domain:apply` (`src/commands/domain/apply.ts`):
  - lists the project's domains and lambdas;
  - plans each entry (`plan.ts` `domainStep`, pure): claim / add / route /
    up to date;
  - claims new platform names (`claimPlatformName`) and adds new custom
    domains (`addProjectDomain`, printing the CNAME + verification records);
  - sets the routing (`setDomainRouting`) of live domains whose routing
    differs.
  - Never removes a domain.
- Every `lambda:create` / `lambda:update` runs the same apply after the save
  (`src/commands/lambda/helpers/index.ts`), best effort like `triggers.time`.
- `domain:list`: a table of the project's domains (kind, status, serves,
  path rules).

## Where

| Path | Role |
|---|---|
| `src/commands/domain/plan.ts` | entry -> routing (names -> ids), match against existing, same-routing check |
| `src/commands/domain/apply.ts` | `applyDomains` + `domain:apply` |
| `src/commands/domain/list.ts`, `index.ts` | `domain:list`, registration |
| `src/services/gql-client.ts` | `listProjectDomains`, `claimPlatformName`, `addProjectDomain`, `setDomainRouting`, `removeProjectDomain` |

## Test / debug

`npx jest test/domains-yaml` (6 specs). Live: with a `lambforge.yaml`
describing an existing domain exactly, `domain:apply` prints `<host> is up
to date` and changes nothing.

CI/CD tokens need the `domain:read` / `domain:write` scopes (graphql-server
catalogue + graphql-server-lambdas `CI_SCOPE_OPERATIONS`).
