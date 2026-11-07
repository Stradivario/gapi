## 2026-11-07 - cli-browser-login: login: upload URL defaults to <API origin>/upload-lambda; --ci needs no --key

**Feature:** cli-browser-login · **Type:** fix

- `gcli login` without `--uploadUrl` now uses the API URL's **origin** +
  `/upload-lambda` (`src/commands/auth/login-urls.ts`). It used to append
  to the whole `--url`: `https://pubsub.graphql-server.com/graphql` ->
  `.../graphql/upload-lambda`, `https://api.lambforge.com/` ->
  `...//upload-lambda`. An explicit `--uploadUrl` still wins.
- `GraphqlClienAPI.getConfig()` applies the same default when the
  `upload-url` file is missing (older logins) or empty (`mcp:start`
  login-gate), so `lambda:create/update` always has an upload server.
- `gcli login --ci --token <t>` without `--key` crashed:
  `TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument ... Received
  undefined` (the key file was written with `undefined`). It now writes
  `''` - the key only refreshes Firebase tokens, never a CI token.
- **Test:** `npx jest test/login-urls.spec.ts`; manually, in a throwaway
  HOME: `HOME=$(mktemp -d) node release/index.js login --ci --token x --url
  https://api.lambforge.com` -> exit 0, `~/.graphql-server/upload-url` =
  `https://api.lambforge.com/upload-lambda`, `key` empty.
- **Debug:** uploads going to the wrong host -> `cat
  ~/.graphql-server/url ~/.graphql-server/upload-url`; re-login with
  `--uploadUrl` to override.
- **Verification:** 3 new unit tests; full gcli suite 142/142 (18 suites);
  `tsc --noEmit` clean; built CLI run with no URL, api.lambforge.com,
  graphql-server's `/graphql` URL and an explicit `--uploadUrl`, all
  without `--key`: every run exits 0 with the expected files.
