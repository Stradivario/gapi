# MCP proxy (`gcli mcp:start`)

**Feature slug:** `mcp-proxy` · history: `node scripts/changelog.mjs render --feature mcp-proxy`.

`gcli mcp:start` is a stdio MCP server that Claude Code / other clients run
locally (`claude mcp add --scope user lambforge -- gcli mcp:start`). It
forwards every request to the platform's MCP endpoint
(`<login url without /graphql>/mcp`, or `--url`) over streamable HTTP, as the
`gcli login` user. Code: `src/commands/proxy/start.ts`.

## Auth

The login token is a Firebase ID token (1 h). Every forwarded request reads
it through `GraphqlClienAPI.getConfig()`, which refreshes it after 30 min
(`currentToken()`, one shared refresh for concurrent requests). An HTTP
401/403 forces a refresh and one retry.

Until 2026-11-02 the token was fixed at startup: after an hour every tool
call failed with `401: Unauthorized`. The upstream answers HTTP 200 with the
subgraph's 401 inside the tool result, so the 401 retry never fired - the
gateway logs `auth/id-token-expired`.

## How to debug

- All tools 401 at once: the gateway's `[GATEWAY][ERROR]` log names the
  reason (`auth/id-token-expired` = token). `gcli project:list` refreshes
  the stored token; a proxy older than this fix needs a reconnect (`/mcp`).
- Tools missing from the list: the proxy forwards whatever the deployed
  `mcp` lambda serves - compare with
  `graphql-server-functions/packages/mcp/lambforge.yaml` (plan 16 D3).
