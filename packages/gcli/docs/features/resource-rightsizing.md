# resource-rightsizing (gcli slice)

Canonical doc: graphql-server-lambdas `docs/features/resource-rightsizing.md`
(plan 50, graphql-server `docs/plans/50-cost-optimization-from-cast-ai.md`).

| Command | API |
|---|---|
| `lambda:resources [-n] [--auto\|--fixed] [--days] [--json]` | `lambdaResourceRecommendations`, `setLambdaResourcesMode` |
| `plugin:resources [-n] [--apply] [--days] [--json]` | `pluginResourceRecommendations`, `updatePluginSettings(resources)` |
| `plugin:auto-grow <plugin> --on\|--off [-cid]` | `updatePluginSettings(autoGrowStorage)` |
| `sleep-schedule:list` | `sleepSchedules` |
| `sleep-schedule:set <name> [--days] [--wake] [--sleep] [--timezone] [--pause\|--resume]` | `saveSleepSchedule` (create or change by name; only the flags given) |
| `sleep-schedule:delete <name>` | `deleteSleepSchedule` (refused while lambdas follow it) |
| `sleep-schedule:sleep <name>`, `sleep-schedule:wake <name>` | `sleepScheduleNow`, `wakeScheduleNow` |
| `project:savings` | `projectSavings` |
| `cluster:pod-placement -c --mode spread\|fill` | `setProjectClusterPodPlacement` |
| `cluster:autoscale --replace-cheaper / --no-replace-cheaper` | `updateProjectClusterAutoscale(replaceCheaper)` |

Code: `src/services/cost-optimization.ts` (`CostAPI`), `src/commands/cost/`
(`parse.ts` is pure: days, schedule names, sleep-schedule flags, rows, the
lambforge.yaml snippet, plugin limits kept). `lambda:resources` never applies a
recommendation server-side: a deploy from lambforge.yaml sets the yaml
values, so it prints the `scaleOptions` lines instead. Lambdas in `--auto`
keep their sized minCpu / minMemory through a deploy (server side,
`keepAutoSized` in graphql-server-lambdas).

## Sleep schedules

Named schedules replaced the per-project hibernation on 2026-11-28 (the
`project:hibernation` / `project:sleep` / `project:wake` commands and the
`projectHibernation`, `setProjectHibernation`, `hibernateProjectNow`,
`wakeProjectNow` API are gone; canonical server doc: graphql-server-lambdas
`docs/features/hibernation.md`). A lambda follows one through
`scaleOptions.sleepSchedule: <name>` (lambforge.yaml, or
`--sleepSchedule` on `lambda:create` / `lambda:update`; `''` = always on).

- Name rule `^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$` lives once in
  `parse.ts` (`SLEEP_SCHEDULE_NAME`), checked client-side by every
  `sleep-schedule:*` command and by `lambda/helpers/sleep-schedule.ts`; the
  schema (`src/schema/lambforge.schema.json`) carries the same pattern (or
  empty) and `repo/schema-check.ts` now enforces `pattern`.
- Deploy payload: `sleepSchedule` is sent only when the flag or the spec
  sets it (so gcli still talks to an API without the field); the server
  stores `null` when it is not sent.
- `plan` / `apply` compare it like the other scaleOptions keys (only when
  the file sets it; `''` and `null` are the same); `export` writes it when
  set. Both read it from `lambda.fragment.ts` / the plan's lambda query.

Test: `npx jest --coverage=false test/cost-commands.spec.ts test/repo-plan.spec.ts`.
