## 2026-11-18 - local-workspaces: watch/open + watch/close: the browser editor watches files without a terminal

**Feature:** local-workspaces · **Type:** feat

- Found by the owner: a file edited in his own IDE did not update in the
  Lambforge editor - changes were only watched while a browser terminal
  was open.
- `TerminalManager.watch()` / `unwatch()`: a watch of its own (recursive
  fs.watch, 150 ms batches, .gitignore'd paths dropped) pushing `changed`
  events under its sessionId; terminals are shells only now. Ops
  `watch/open`, `watch/close` - no `--allow-terminal` needed (names only,
  what `list` shows anyway). Max 4 watches.
- **Test:** `npx jest test/workspace-terminals.spec.ts --coverage=false`
  (a watch reports changes; watch/open works without the flag).
- **Debug:** no updates in the browser -> the gcli log shows "the browser
  editor watches the files" when the editor opens; older gcli has no watch.
- **Verification:** tsc clean, `npm run lint`, jest workspace specs 50/50.
