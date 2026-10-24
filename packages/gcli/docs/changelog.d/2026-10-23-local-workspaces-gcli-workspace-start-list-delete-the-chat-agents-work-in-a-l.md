## 2026-10-23 - local-workspaces: gcli workspace:start/list/delete - the chat agents work in a local directory

**Feature:** local-workspaces · **Type:** feat

- New `workspace:start` (connect the current directory; registers it with the `gcli login` account in the `--project` / `project:use` project, token saved per directory in `~/.graphql-server/workspaces.json`), `workspace:list`, `workspace:delete`. Options: `--allow`, `--no-default-allow`, `--yolo`, `--no-terminal-approval`, `--env`, `--inherit-env`, `--allow-secrets`, `--token`, `--wsUrl`, `--reset`.
- The runner's WebSocket client is now a shared base class `TunnelConnection` (`src/commands/runner/tunnel.ts`); `RunnerConnection` keeps its behaviour (same tests) and `WorkspaceConnection` (`src/commands/workspace/connection.ts`) serves `POST /workspace/<op>`.
- `WorkspaceFiles`: everything confined to the root (symlinks resolved), `.git` read-only, secrets files hidden unless `--allow-secrets`, git-aware listing/search (`.gitignore` respected, `node_modules` skipped), edits by exact unique match with content-hash conflict checks.
- `CommandPolicy` + `ApprovalGate`: read-only defaults and `--allow` rules run unasked; everything else asks in the terminal AND on the chat card (first answer wins, 5-min expiry); destructive commands always ask unless `--yolo`; "always" remembers program + verb for the session.
- `runCommand` / `ProcessManager`: process groups (children die too), timeouts, output tails, background processes with a ring buffer and `waitFor`; all stopped when gcli exits. Commands get a minimal environment unless `--env` / `--inherit-env`.
- Backend half in graphql-server (registry, tunnel, agent tools, LOCAL worker), UI in gql-fission. Canonical doc: `graphql-server/docs/features/local-workspaces.md`.
- **Test:** `npx jest --coverage=false test/workspace test/runner` - files (escape, symlink, secrets, .gitignore, edit/hash), policy, approvals (web wins, early web answer, terminal deny, expiry), commands/processes (exit codes, timeout kill, waitFor/logs/stop), the connection end to end against a fake server.
- **Debug:** gcli's own log (`->`, `✎`, `$`, `▶`, `?`, `x`); "refused this workspace" = deleted -> `--reset`; wrong environment -> `~/.graphql-server/url`.
- **Verification:** full gcli suite 99/99 passing, `npx tsc --noEmit -p .` clean, `npx eslint src test` clean. Not yet run against a live backend.
