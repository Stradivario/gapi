## 2026-11-18 - local-workspaces: A new editor watch at the cap drops the oldest instead of being refused

**Feature:** local-workspaces · **Type:** fix

- A reloaded or closed browser tab never closes its file watch. After four
  reloads `watch/open` answered "At most 4 editors watching at a time" and
  the editor silently showed no changes from disk (found when the assistant
  wrote a file that never appeared). `TerminalManager.watch` now closes the
  oldest watch at the cap.
- **Test:** `npx jest test/workspace-terminals.spec.ts --forceExit` (15).
- **Debug:** graphql-server log: an error on `watchLocalWorkspace`.
- **Verification:** 15/15, lint clean.
