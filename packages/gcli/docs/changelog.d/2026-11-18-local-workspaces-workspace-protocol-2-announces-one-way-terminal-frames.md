## 2026-11-18 - local-workspaces: Workspace protocol 2: announces one-way terminal frames

**Feature:** local-workspaces · **Type:** fix

- `WORKSPACE_VERSION` = `gcli-workspace/2` (`clientVersion` on every
  heartbeat): the backend sends one-way `input` / `resize` frames only to
  protocol 2+. It cannot tell from an npm version - gcli never reported one
  (1.8.273 had the frames but still said /1, so it got request/response).
- **Test:** a workspace record's `clientVersion` after `gcli workspace:start`.
- **Debug:** `/1` = old gcli: keystrokes go request/response, no resize.
- **Verification:** tsc; the frames themselves: workspace-terminals spec (14).
