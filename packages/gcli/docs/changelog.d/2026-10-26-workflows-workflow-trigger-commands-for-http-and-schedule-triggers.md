## 2026-10-26 - workflows: workflow:trigger commands for HTTP and schedule triggers

**Feature:** workflows · **Type:** feat

- `workflow:trigger:add` (`--http [--path] [--method]` or `--cron
  "<schedule>" [-i | --input-file]`), `workflow:trigger:list`,
  `workflow:trigger:remove -t <id | path | schedule | Fission name>`
  (`src/commands/workflow/trigger-*.ts`), on the graphql-server-lambdas
  `addWorkflowTrigger` / `removeWorkflowTrigger` (Fission 1.26+ fork
  `workflow-triggers` creates the runs).
- Option handling and output are pure (`triggers.ts`: `buildTriggerInput`,
  `findTrigger`, `triggerRow`, `runSource`); `workflow:runs` gained a `by`
  column (manual / http / schedule). `WorkflowFragment.triggers`,
  `WorkflowRunFragment.triggerKind / triggerName`; client calls in
  `gql-client.ts`.
- README Workflows section + regenerated `README-CLI.md`.
- **Test:** `npx jest --coverage=false test/workflow.spec.ts` (11 pass, 5 new).
- **Debug:** `Workflow triggers need Fission 1.26 or newer on this cluster`
  is the backend saying the cluster is too old; `Pass either --http or
  --cron` is the option check.
- **Verification:** gcli jest 114/114; tsc + eslint clean; the new
  mutations and fragments validated against the local gateway schema;
  not run against production (gcli login points at production).
