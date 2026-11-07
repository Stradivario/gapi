# gcli: login defaults - upload URL from the API origin, `--ci` without `--key`

## Summary

Two `gcli login` fixes found while wiring a CI deploy (legends,
`.github/workflows/lambforge-deploy.yml`):

1. **Upload URL default.** Without `--uploadUrl`, gcli now uses the API
   URL's **origin** + `/upload-lambda`. It used to append to the whole
   `--url`, which breaks for any API URL with a path or a trailing slash.
2. **`--ci` without `--key` crashed.** The documented CI recipe
   (`gcli login --ci --token <t>`) failed with
   `TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument must be of type
   string ... Received undefined`, because the key file was written with
   `undefined`. CI pipelines had to pass `--key ''` as a workaround.

## Changes

### Upload URL (`src/commands/auth/login-urls.ts`, new)

| `--url` | before | after |
|---|---|---|
| *(none)* | `https://api.lambforge.com/upload-lambda` | same |
| `https://api.lambforge.com` | `https://api.lambforge.com/upload-lambda` | same |
| `https://api.lambforge.com/` | `https://api.lambforge.com//upload-lambda` | `https://api.lambforge.com/upload-lambda` |
| `https://pubsub.graphql-server.com/graphql` | `https://pubsub.graphql-server.com/graphql/upload-lambda` | `https://pubsub.graphql-server.com/upload-lambda` |
| any, with `--uploadUrl X` | `X` | `X` (unchanged: explicit wins) |

- `defaultUploadUrl(apiUrl)` / `resolveUploadUrl(uploadUrl, apiUrl)`;
  `MAIN_LAMBFORGE_API` moved here (login.ts keeps its alias).
- `src/commands/auth/login.ts`: `loginWithToken` writes
  `resolveUploadUrl(cmd.uploadUrl, cmd.url)`.
- `src/services/gql-client.ts` `getConfig()`: a missing `upload-url` file
  (logins from before it existed) or an empty one (the `mcp:start`
  login-gate writes `''`) resolves from the stored `url` too, so
  `lambda:create` / `lambda:update` always have an upload server.

### `--ci` without `--key` (`src/commands/auth/login.ts`)

- The key file gets `cmd.key ?? ''`. The key is only used to refresh a
  Firebase token older than 30 minutes; a CI token is never refreshed, so
  an empty key is correct.

### Docs

- `packages/gcli/docs/features/cli-browser-login.md` (gcli slice): the URL
  helpers, the `--ci` rule, the new test.
- Changelog fragment `packages/gcli/docs/changelog.d/2026-11-07-cli-browser-login-login-upload-url-defaults-to-api-origin-upload-lambda-ci-nee.md`.

## Before / after for CI

```bash
# before (workaround)
npx @gapi/gcli login --ci --token "$TOKEN" --key '' \
  --url https://api.lambforge.com --uploadUrl https://api.lambforge.com/upload-lambda

# after
npx @gapi/gcli login --ci --token "$TOKEN" --url https://api.lambforge.com
```

Existing pipelines keep working: `--key ''` and an explicit `--uploadUrl`
are still accepted.

## Testing

- New `test/login-urls.spec.ts` (3 tests): origin derivation incl. trailing
  slash, a `/graphql` path and localhost; no URL -> Lambforge API; explicit
  `--uploadUrl` wins, empty falls back.
- Full suite: `npx jest` -> **142/142** (18 suites). `tsc --noEmit` clean,
  eslint clean on the changed files.
- Built CLI (`npm run build`, then `node release/index.js`), each run in a
  throwaway `HOME` with a dummy token and **no `--key`**:

  | args | exit | `upload-url` |
  |---|---|---|
  | *(none)* | 0 | `https://api.lambforge.com/upload-lambda` |
  | `--url https://api.lambforge.com` | 0 | `https://api.lambforge.com/upload-lambda` |
  | `--url https://pubsub.graphql-server.com/graphql` | 0 | `https://pubsub.graphql-server.com/upload-lambda` |
  | `--url https://api.lambforge.com --uploadUrl https://up.example.com/x` | 0 | `https://up.example.com/x` |

  `key` was written empty in every run.

`release/index.js` is not part of this PR (it is rebuilt at the version
bump, like the other fix commits).

## Follow-up after release

- legends `.github/workflows/lambforge-deploy.yml`: drop `--key ''` and
  `--uploadUrl`, bump `@gapi/gcli` in `apps/*/package.json`.
