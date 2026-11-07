# cli-browser-login - gcli slice

Canonical doc: graphql-server `docs/features/cli-browser-login.md`.

- `src/commands/auth/browser-login.ts`: start, poll and wait over
  unauthenticated gateway calls (node-fetch), and opening the browser
  (child_process).
- `src/commands/auth/login.ts`: no `--token` runs the browser flow;
  `loginWithToken` is the shared path that writes `~/.graphql-server/`
  (`silent` for MCP).
- `src/commands/auth/login-urls.ts`: `defaultUploadUrl(apiUrl)` = the API
  URL's origin + `/upload-lambda` (no `--url` -> `https://api.lambforge.com`);
  `resolveUploadUrl(uploadUrl, apiUrl)` - an explicit `--uploadUrl` wins.
  Used by `loginWithToken` and by `GraphqlClienAPI.getConfig()` (missing or
  empty `upload-url` file -> derived from `url`).
- `--ci` needs no `--key`: the key file gets `''` (a CI token is never
  refreshed through Firebase).
- `src/commands/proxy/login-gate.ts`: `mcp:start` before login serves only
  `LambforgeLogin`.
- Tests: `test/browser-login.spec.ts`, `test/login-urls.spec.ts`.
