## 2026-11-18 - local-workspaces: a --ci login is never refreshed

**Feature:** local-workspaces · **Type:** fix

- `GraphqlClienAPI.getConfig` (`src/services/gql-client.ts`): a login
  without an API key (`gcli login --ci --token`) is not "expired" after 30
  minutes any more. It used to call the Firebase refresh with an empty key
  and overwrite the stored token with nothing, so every command failed half
  an hour after the login. CI pipelines never noticed (they log in per
  run); a cloud workspace pod signed in with a project token (plan 37) is
  logged in once and lives for weeks.
- **Test:** `gcli login --ci --token <ci token>`, set
  `~/.gapi/...` generation time back an hour, run `gcli lambda:list`.
- **Debug:** "not logged in" / 401 some time after a --ci login on an
  older gcli = this bug.
- **Verification:** tsc clean. Not run against a live token yet (checked
  with the cloud workspace change that uses it).
