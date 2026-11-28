# Hibernation - sleep schedules (slice)

Canonical doc: graphql-server-lambdas `docs/features/hibernation.md`.

This package has:
- the `sleep-schedule:list|set|delete|sleep|wake` commands
  (`src/commands/cost/sleep-schedule.ts`, parsing in `parse.ts`, API calls
  in `src/services/cost-optimization.ts`)
- `--sleepSchedule` on `lambda:create` / `lambda:update`
- `scaleOptions.sleepSchedule` in the lambforge.yaml schema, `plan` /
  `apply` drift and `export`.

When a yaml file leaves the key out, the server keeps the lambda's stored
schedule. `''` detaches it.
