## 2026-11-18 - local-workspaces: workspace:start --allow-terminal: browser terminals (script PTY) and file watch pushed to Lambforge

**Feature:** local-workspaces · **Type:** feat

- Plan 36 phase 2 (gcli). `--allow-terminal` lets the owner open a shell in
  the workspace root from the Lambforge editor; without it every
  `terminal/*` op answers 403 with the hint.
- `terminals.ts` (`TerminalManager`): `$SHELL -i` in a PTY through the
  system's `script` (no native dependency; pipes where it is missing), a
  recursive `fs.watch` of the root (`node_modules`/`.git` ignored), events
  on an rxjs Subject; the connection batches them (40 ms) into
  `pushLocalWorkspaceTerminalEvents`. Max 4 terminals; close kills the
  process group; stop closes all.
- Ops `terminal/open`, `terminal/input`, `terminal/close` added to
  `WORKSPACE_OPS`.
- **Test:** `npx jest test/workspace-terminals.spec.ts --coverage=false`
  (output, changed file, close, cap, flag required).
- **Debug:** no PTY (no echo/line editing) -> `script` missing on the
  machine; no changed-file events -> recursive `fs.watch` unsupported there.
- **Verification:** tsc clean, eslint, jest workspace + terminals 30/30.
