## 2026-11-03 - lambda-site-url: lambda:create/update print URL and Site

**Feature:** lambda-site-url · **Type:** feat

- After the result JSON, `lambda:create` and `lambda:update` print
  `URL: <url>` and, for a public shared-cluster lambda,
  `Site: https://<projectId>-<route>.lambforge.com`
  (`printAddresses` in `src/commands/lambda/helpers/index.ts`).
- `siteUrl` is read with a separate, best-effort `getLambda`, so gcli still
  works against an API without the field.
- **Test:** `gcli lambda:update` on a static lambda prints both lines.
- **Debug:** no `Site:` line on a public lambda means the API lacks
  `siteUrl` (graphql-server-lambdas older than 2026-11-03), or the lambda
  is on a private cluster.
- **Verification:** 136 tests passed. tsc and eslint are clean.
