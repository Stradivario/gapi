## 2026-11-28 - hibernation: sleep-schedule:* commands and scaleOptions.sleepSchedule replace project hibernation

**Feature:** hibernation · **Type:** feat

- The platform replaced per-project hibernation with named sleep schedules
  that lambdas follow (server feature `hibernation`, graphql-server-lambdas).
  `project:hibernation`, `project:sleep` and `project:wake` are removed.
  New: `sleep-schedule:list`, `sleep-schedule:set <name>` (`--days`,
  `--wake`, `--sleep`, `--timezone`, `--pause` / `--resume`, only the flags
  given change), `sleep-schedule:delete <name>`, `sleep-schedule:sleep
  <name>`, `sleep-schedule:wake <name>`. All take `-p` and `--json`.
  Code: `src/commands/cost/sleep-schedule.ts` (was `hibernation.ts`),
  `parse.ts` (`toSleepScheduleInput`, `sleepScheduleRow`,
  `SLEEP_SCHEDULE_NAME`), `CostAPI.sleepSchedules / saveSleepSchedule /
  deleteSleepSchedule / sleepScheduleNow / wakeScheduleNow` in
  `src/services/cost-optimization.ts`. No query selects the removed
  `projectHibernation*` fields any more.
- `scaleOptions.sleepSchedule` (lambforge.yaml, or `--sleepSchedule <name>`
  on `lambda:create` / `lambda:update`, `''` = always on). The schema has it
  with the name pattern or empty, and `repo/schema-check.ts` now enforces
  `pattern`. `lambda/helpers/sleep-schedule.ts` adds it to the deploy
  payload only when set. `repo/drift.ts` compares it and `repo/export.ts`
  writes it. `lambda.fragment.ts`, the plan's lambda query and
  `@introspection` read it.
- Needs the server with `sleepSchedules` and `LambdaScaleOptions.sleepSchedule`.
  An older server answers "Cannot query field sleepSchedule" on every
  lambda read that uses the fragment.
- README: the sleep schedules section and `sleepSchedule` in the yaml
  example. README-CLI regenerated.
- **Test:** `npx jest --coverage=false test/cost-commands.spec.ts
  test/repo-plan.spec.ts`. These cover flag parsing, the name rule, the list
  row, payload pass-through, drift, the schema pattern and export.
  Manual (dev stack): `gcli sleep-schedule:set office --days mon-fri --wake
  08:00 --sleep 20:00 --timezone Europe/Sofia`, then a newdeploy lambda with
  `minScale: 1` and `sleepSchedule: office`, then `sleep-schedule:list`
  shows it under LAMBDAS.
- **Debug:** a 400 on deploy = the yaml names a schedule the project does
  not have (`sleep-schedule:list`). If `delete` is refused, the error names
  the lambdas still following the schedule. If `plan` shows
  `scaleOptions.sleepSchedule` drift, the stored name differs; `''` and
  `null` count as equal. A file without the key is no opinion: the server
  keeps the stored schedule on an update (graphql-server-lambdas
  `keptSleepSchedule`).
- **Verification:** 290 tests pass (37 suites). `tsc` and eslint are clean
  on the changed files. `sleep-schedule:* --help` was checked from a local
  build. Nothing was run against the platform.
