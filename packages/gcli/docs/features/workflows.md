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
| `workflow:runs -n [-l]` | `listWorkflowRuns` |
| `workflow:status -n -r run [--follow]` | `getWorkflowRun` (events, error, output) |
| `workflow:cancel -n -r run` | `cancelWorkflowRun` |

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
`gcli workflow:run -n demo --wait`.

## How to debug

- `No workflow "x"`: names are per project (`-p` or the `gcli login`
  project).
- `Workflows are not available on your current plan`: the plan lacks
  `allowWorkflows`.
- `Workflows are not enabled on this cluster`: the cluster runs Fission
  without `workflows.enabled` (canonical doc, Requires).
