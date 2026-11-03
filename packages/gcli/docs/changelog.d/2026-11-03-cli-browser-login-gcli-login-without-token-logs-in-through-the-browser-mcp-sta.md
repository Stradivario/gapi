## 2026-11-03 - cli-browser-login: gcli login without --token logs in through the browser; mcp:start offers LambforgeLogin

**Feature:** cli-browser-login · **Type:** feat

- `gcli login` with no `--token` (`src/commands/auth/browser-login.ts`):
  1. calls `startCliLogin` on the gateway without auth;
  2. prints the link and code, opens the browser (child_process: `xdg-open`
     / `open` / `cmd start`; `--no-browser` skips it);
  3. polls `pollCliLogin` every 2 s; a network blip keeps waiting;
  4. passes the returned token and key to the existing `loginWithToken`
     path.
  No new dependencies. `--token` without `--key` now explains itself.
- `gcli mcp:start` with no `~/.graphql-server/token`
  (`src/commands/proxy/login-gate.ts`) serves only the `LambforgeLogin`
  tool:
  - the first call returns the link and code and waits in the background;
  - the next call reports "still waiting", or "logged in, reconnect".
  Nothing goes to stdout (it is the MCP channel); `loginWithToken` has a
  `silent` flag.
- Without `--url` the gate uses `https://api.lambforge.com`. With
  `--url <gateway>/mcp` it strips the `/mcp`.
- **Test:** `npx jest --coverage=false test/browser-login.spec.ts`:
  - link and code printed, the browser opened once;
  - the session id is never printed;
  - no Authorization header is sent;
  - a network blip, deny, expiry, and `--no-browser`.
- **Debug:** the canonical doc is graphql-server
  `docs/features/cli-browser-login.md`. gcli waiting forever means the page
  never approved (browser console). The gate logs to stderr.
- **Verification:** `npx jest --coverage=false`: 136 passed. `tsc --noEmit`
  and eslint are clean. Not run against a live API yet.
