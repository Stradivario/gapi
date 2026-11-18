## 2026-11-18 - local-workspaces: list returns mtimeMs (the browser's file cache key)

**Feature:** local-workspaces · **Type:** feat

- `WorkspaceFiles.list`: every file entry carries `mtimeMs` next to `size`
  (the same `stat`). The Lambforge editor caches a local workspace's files
  in the browser and serves one from there only while size + mtime match.
- **Test:** `npx jest test/workspace-gitignore.spec.ts --coverage=false`
  (the listing has size + mtimeMs).
- **Debug:** the browser never caches contents -> this gcli is older (no
  `mtimeMs` in `list`).
- **Verification:** tsc clean, `npm run lint`, jest workspace specs 49/49.
