# Local workspaces (gcli slice)

**Status:** built 2026-10-23. **Feature slug:** `local-workspaces`.
Canonical doc (flow, backend, security model, debugging):
`graphql-server/docs/features/local-workspaces.md`.

`gcli workspace:start` serves the current directory to the chat agents over
the outbound WebSocket tunnel local AI runners use.

## Files

| Path | Responsibility |
|---|---|
| `src/commands/runner/tunnel.ts` | `TunnelConnection` - the shared subscriptions-transport-ws client (connect/reconnect, heartbeat timer, request dispatch, ack/ping, `FrameSender`); `RunnerConnection` and `WorkspaceConnection` extend it |
| `src/commands/workspace/connection.ts` | `WorkspaceConnection`: `workspaceToken`, `localWorkspaceHeartbeat`, the ops allow-list (`WORKSPACE_OPS`, mirrors the backend), `dispatch(op)`, approval frames |
| `src/commands/workspace/files.ts` | `WorkspaceFiles`: root confinement (incl. symlinks), `.git` read-only, secrets files, git-aware list/search, read/write/edit with content hashes |
| `src/commands/workspace/policy.ts` | `CommandPolicy`: default allow rules, `--allow`, always-ask patterns, segment matching, "always" rules |
| `src/commands/workspace/approvals.ts` | `ApprovalGate` (policy -> web card + terminal prompt race, timeout, settle), `TerminalPrompt` |
| `src/commands/workspace/processes.ts` | `runCommand` (timeout, process-group kill, output tails), `ProcessManager` (background processes, ring buffer, waitFor), `buildEnv` |
| `src/commands/workspace/{start,list,delete,config,index}.ts` | the commands; `~/.graphql-server/workspaces.json` (0600, keyed by directory) |

## Protocol (what the backend sends)

`POST /workspace/<op>` with a JSON body, answered `head(status) + chunks + end`
with a JSON body; errors are `{ error }` with 400/403/404/409/500. Ops:
`info list read write edit delete search exec process/start process/list
process/logs process/stop`. Anything else is refused before the ack.
`type: 'approval'` frames carry `{ decision: allow|always|deny }` for an
approval id this client created with `requestLocalWorkspaceApproval`.

## How to test

`npx jest --coverage=false test/workspace` - real files and processes in a
temp dir; the connection runs against a fake subscriptions server
(edit over the tunnel, refused paths, web approval -> command runs, denial).

## How to debug

gcli prints every op: `->` read/list/search, `✎` write/edit/delete, `$`
command (+ exit code and duration), `▶` / `■` processes, `?` approval
needed, `x` failed/cancelled. "refused this workspace" = deleted on the web
(`--reset`). Pointing at the wrong environment: `~/.graphql-server/url`.
