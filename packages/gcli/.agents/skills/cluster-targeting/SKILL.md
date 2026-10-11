---
name: cluster-targeting
description: Add or extend a gcli command that touches a project resource which can live on a private cluster (lambda, environment, logs, load-spec). Use when adding a new --clusterId/--clusterName flag, or when a command's resource lookup needs to disambiguate between the shared cluster and a private one.
---

# gcli: targeting the right cluster

Lambforge projects can have private Talos/Hetzner clusters in addition to
the implicit shared one (full backend architecture:
`graphql-server-lambdas/docs/multi-cluster.md`). Every gcli command that
creates, reads, updates, or deletes a cluster-scoped resource (lambdas,
environments, logs, `load-spec.ts` manifests) needs to resolve which
cluster it's targeting instead of assuming the shared one.

## `resolveClusterId` — the one helper every command should use

`src/helpers.ts`:

```ts
export function resolveClusterId(
  projectId: string,
  hint: { clusterId?: string | null; clusterName?: string | null },
): Observable<string | undefined>
```

- `clusterId` wins when present (checked via `!= null`, **not** truthiness —
  an explicit empty string is a deliberate "shared cluster only" signal on
  some commands like `lambda:list`, and truthiness would silently treat
  that the same as "not provided," changing existing behavior).
- Otherwise, if `clusterName` is given, looks it up via
  `GraphqlClienAPI.projectClusters(projectId)` and resolves to that
  cluster's id — or throws a descriptive error naming
  `cluster:list --project <id>` as the way to see what's available.
- Neither given → resolves `undefined` (the shared cluster).

**Every command that accepts `--clusterId` should also accept
`--clusterName`** (clusterName is unique per project, so `clusterName +
projectId` is just as unambiguous as `clusterId` — and far more readable in
a hand-authored YAML manifest than a raw ObjectId). `clusterId` always wins
when both are passed. Confirmed call sites: `environment:{create,get,update,
delete}`, `lambda:{get,list,delete}`, `lambda:logs`/`logs:builder`,
`lambda/helpers/load-spec.ts` (so a `load-spec.yaml` manifest can reference
a cluster **by name**, keeping the file human-readable instead of full of
raw ObjectIds — see that file for the exact YAML shape).

## Adding a new cluster-scoped command/flag

1. Add `--clusterId <id>` AND `--clusterName <name>` flags to the command.
2. Call `resolveClusterId(projectId, { clusterId, clusterName })` before the
   actual GraphQL call, and pass the resolved id through.
3. If the underlying GraphQL resolver doesn't yet accept a `clusterId` hint
   for this operation, that's a backend gap — see
   graphql-server-lambdas' `multi-cluster-scoping` skill before assuming the
   frontend-side fix alone is sufficient.

## GraphQL layer specifics (different from gql-fission)

gcli builds every GraphQL operation as an inline `gql` template string
directly in `services/gql-client.ts` — there's no `.graphql` file + codegen
pipeline like gql-fission's. Adding a field/operation here is a plain code
edit to that file, not a "regenerate then hand-patch" dance. gcli keeps its
own **separate, hand-maintained** copy of `@introspection/index.ts` — a
type added on the backend still needs to be added here by hand; it is not
shared with or generated from gql-fission's copy.

## Testing

`jest.config.js` has no `moduleNameMapper` for the `~/` tsconfig path alias
— new test files must use relative imports (e.g. `'../src/helpers'`), not
`'~/helpers'`, or the test silently fails to resolve the module.
