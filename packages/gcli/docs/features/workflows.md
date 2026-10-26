# Workflows — gcli slice

**Feature slug:** `workflows` · canonical doc:
`graphql-server-lambdas/docs/features/workflows.md` (AI drafts:
`graphql-server/docs/features/workflows.md`).

`workflow:*` commands (`src/commands/workflow/`), all as the `gcli login`
user through the gateway; workflows are addressed by **name** (resolved to
the id with `listWorkflows`):

| Command | API |
|---|---|
| `workflow:list` | `listWorkflows` |
| `workflow:get -n [-o file]` | `listWorkflows` → YAML |
| `workflow:generate -d "..." [-n name \| --from file] [-o file] [--apply]` | `generateWorkflowDraft` (graphql-server, MiniMax M3.1 Flash); `--apply` = `workflow:apply` |
| `workflow:apply -f file [-n] [-d]` | `createWorkflow`, or `updateWorkflow` when the name exists |
| `workflow:validate -f file` | `validateWorkflow` (graph + lambdas on the cluster) |
| `workflow:delete -n` | `deleteWorkflow` (runs too) |
| `workflow:run -n [-i json \| --input-file] [--wait]` | `startWorkflowRun`; `--wait` polls `getWorkflowRun` every 2 s and prints each new event until the run is terminal |
| `workflow:runs -n [-l]` | `listWorkflowRuns` (column `by`: manual / http / schedule, from `triggerKind`) |
| `workflow:status -n -r run [--follow]` | `getWorkflowRun` (events, error, output) |
| `workflow:cancel -n -r run` | `cancelWorkflowRun` |
| `workflow:trigger:add -n (--http [--path] [--method a,b] \| --cron "<schedule>" [-i json \| --input-file])` | `addWorkflowTrigger`; prints the trigger and, for HTTP, a `curl` line |
| `workflow:trigger:list -n` | the workflow's `triggers` (id, kind, URL or schedule, input) |
| `workflow:trigger:remove -n -t <id \| path \| schedule \| Fission name>` | `removeWorkflowTrigger` |

Triggers (2026-10-26) are HTTP URLs (`<router>/<projectId>/workflows/<path>`,
the JSON body is the run input, 202 `{run}`) and schedules (cron, UTC, with a
fixed input) that start runs. Fission 1.26+ (fork `workflow-triggers`) on the
workflow's cluster creates the run. The option handling is pure and tested:
`src/commands/workflow/triggers.ts` (`buildTriggerInput`, `findTrigger`,
`triggerRow`, `runSource`).

The workflow file (`definition.ts` `parseWorkflowFile`) accepts
`workflow: {name, description, clusterId, definition}`, the same without the
`workflow:` key, a Fission `kind: Workflow` manifest, or a bare definition;
`toWorkflowYaml` writes the first form. API calls are in
`src/services/gql-client.ts` (Workflows section), selection sets in
`src/services/types/workflow.fragment.ts`, types in
`src/commands/workflow/types.ts`.

Not granted to CI tokens (INTEGRATION role) yet: the workflow resolvers are
USER-only in graphql-server-lambdas, so these commands need `gcli login`.

## How to test

`npx jest --coverage=false test/workflow.spec.ts`. Real: log in to a
gateway whose project has `allowWorkflows`, then
`gcli workflow:generate -d "..." -n demo --apply` and
`gcli workflow:run -n demo --wait`; triggers:
`gcli workflow:trigger:add -n demo --http`, then `curl -X POST <url> -d '{}'`
and `gcli workflow:runs -n demo` shows the run `by` http.

## How to debug

- `No workflow "x"`: names are per project (`-p` or the `gcli login`
  project).
- `Workflows are not available on your current plan`: the plan lacks
  `allowWorkflows`.
- `Workflows are not enabled on this cluster`: the cluster runs Fission
  without `workflows.enabled` (canonical doc, Requires).
- `Workflow triggers need Fission 1.26 or newer on this cluster`: the
  cluster's Fission CRDs predate workflow triggers.
- `Pass either --http or --cron`: exactly one of them.
