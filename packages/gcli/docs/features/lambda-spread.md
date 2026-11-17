# lambda-spread (gcli slice)

Canonical: graphql-server-lambdas `docs/features/lambda-spread.md` (plan 33).

- Flags: `--spread machines|none`, `--spreadStrict true|false` on
  `lambda:create` / `lambda:update`.
- yaml: `function.scaleOptions.spread`, `function.scaleOptions.spreadStrict`.
- `src/commands/lambda/helpers/spread.ts` - only set values are sent; flags
  win over the yaml; unknown values refused before the call.
