## 2026-11-17 - lambda-spread: lambda:create/update --spread and --spreadStrict, lambforge.yaml spread keys

**Feature:** lambda-spread · **Type:** feat

- `lambda:create` / `lambda:update` take `--spread machines|none` and
  `--spreadStrict true|false`; `lambforge.yaml` takes
  `function.scaleOptions.spread` / `spreadStrict`. Flags win over the yaml.
  Sent only when set (`helpers/spread.ts` `spreadScaleOptions`), so gcli
  works against an API without the fields and an update without them keeps
  the lambda's current choice. Canonical doc: graphql-server-lambdas
  `docs/features/lambda-spread.md`.
- **Test:** `npx jest --coverage=false test/lambda-spread.spec.ts`.
- **Debug:** "--spread must be 'machines' or 'none'" = a typo in the flag or
  yaml. An API older than the feature answers `Field "spread" is not defined
  by type "LambdaScaleInputOptions"`.
- **Verification:** jest 174/174, tsc clean.
