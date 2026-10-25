## 2026-10-25 - workflows: workflow commands with AI drafts

**Feature:** workflows · **Type:** feat

- New `workflow:*` commands (`src/commands/workflow/`): list, get (YAML), generate (AI draft via `generateWorkflowDraft`, from plain language or as a change to an existing workflow / file; `-o` writes YAML, `--apply` saves), apply (create or update by name), validate, delete, run (`--wait` prints each step event live until the run ends), runs, status (`--follow`), cancel. Workflows are addressed by name. Files: `workflow: {name, description, definition}`, a `kind: Workflow` manifest, or a bare definition. API in `gql-client.ts` (Workflows section), fragments in `services/types/workflow.fragment.ts`.
- **Test:** `npx jest --coverage=false test/workflow.spec.ts` (file shapes, input parsing, event rendering, apply create/update, generate change + apply, run --wait).
- **Debug:** see `docs/features/workflows.md`; the commands need a user login (not granted to CI tokens yet).
- **Verification:** jest 6/6; tsc + eslint clean; build OK and `--help` lists the 10 commands (`release/index.js` restored, README-CLI.md regenerated); all 10 GraphQL documents validated against the live local gateway schema. Not run end to end here: the gcli login points at production, which has no workflows yet.
