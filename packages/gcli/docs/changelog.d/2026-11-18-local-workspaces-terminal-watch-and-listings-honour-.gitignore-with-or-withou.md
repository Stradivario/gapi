## 2026-11-18 - local-workspaces: Terminal watch and listings honour .gitignore, with or without git

**Feature:** local-workspaces · **Type:** fix

- Found live by the owner: with the browser terminal open, a running build
  (dist/, .parcel-cache/) sent every written file to the editor, which read
  each one back through the tunnel.
- `TerminalManager`: changed paths batched (150 ms), de-duplicated and
  filtered by `WorkspaceFiles.notIgnored` before they are pushed.
- `notIgnored`: git's `check-ignore --stdin` inside a repo with git
  installed; otherwise `gitignore.ts` (`GitignoreMatcher`, our own - no
  package: nested `.gitignore` files, `!`, `dir/`, `/` anchors, `*`, `**`,
  `?`, `[...]`, nothing back from inside an ignored folder). A changed
  `.gitignore` re-reads the rules.
- The listing of a folder WITHOUT git now skips ignored files and folders
  too (with git it already used `git ls-files --exclude-standard`).
- **Test:** `npx jest test/workspace-gitignore.spec.ts test/workspace-terminals.spec.ts --coverage=false`.
- **Debug:** a build still floods the editor -> its output is not in a
  `.gitignore`; check with `git check-ignore -v <path>` (git) or the matcher
  spec's table (no git).
- **Verification:** tsc clean, eslint, jest 24 suites / 208 tests (pattern
  table 13, nested + negation, no-git folder watch filter + listing, rule
  reload; a real git repo dropping dist/).
