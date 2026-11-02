## 2026-11-02 - mcp-proxy: mcp:start refreshes the login token per request instead of failing every call with 401 after an hour

**Feature:** mcp-proxy · **Type:** fix

- `src/commands/proxy/start.ts`: `performFetch` sets `Authorization` from
  `currentToken()` (via `GraphqlClienAPI.getConfig()`, refreshed after
  30 min; concurrent requests share one refresh) on every forwarded request.
  The token used to be fixed in the transport's `requestInit` at startup, and
  the 401 retry only fixed that one request - and never ran anyway, because
  the upstream returns 200 with the subgraph's 401 inside the tool result.
- New feature doc `docs/features/mcp-proxy.md` (plan 16 C4 in graphql-server).
- **Test:** `npx jest --coverage=false test/mcp-proxy-token.spec.ts` - token
  read per request, one shared refresh, forced refresh + retry on 401.
- **Debug:** gateway log `auth/id-token-expired`; proxy stderr `[DEBUG]
  Request failed with 401. Refreshing token...`.
- **Verification:** 129/129 gcli tests, `tsc --noEmit` clean, eslint clean;
  live check pending (needs an MCP session running > 1 h on the new build).
