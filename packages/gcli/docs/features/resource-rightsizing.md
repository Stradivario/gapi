# resource-rightsizing (gcli slice)

Canonical doc: graphql-server-lambdas `docs/features/resource-rightsizing.md`
(plan 50, graphql-server `docs/plans/50-cost-optimization-from-cast-ai.md`).

| Command | API |
|---|---|
| `lambda:resources [-n] [--auto\|--fixed] [--days] [--json]` | `lambdaResourceRecommendations`, `setLambdaResourcesMode` |
| `plugin:resources [-n] [--apply] [--days] [--json]` | `pluginResourceRecommendations`, `updatePluginSettings(resources)` |
| `plugin:auto-grow <plugin> --on\|--off [-cid]` | `updatePluginSettings(autoGrowStorage)` |
| `project:hibernation [--enable\|--disable] [--timezone] [--days] [--wake] [--sleep]` | `projectHibernation`, `setProjectHibernation` |
| `project:sleep`, `project:wake` | `hibernateProjectNow`, `wakeProjectNow` |
| `project:savings` | `projectSavings` |
| `cluster:pod-placement -c --mode spread\|fill` | `setProjectClusterPodPlacement` |
| `cluster:autoscale --replace-cheaper / --no-replace-cheaper` | `updateProjectClusterAutoscale(replaceCheaper)` |

Code: `src/services/cost-optimization.ts` (`CostAPI`), `src/commands/cost/`
(`parse.ts` is pure: days, hibernation flags, rows, the lambforge.yaml
snippet, plugin limits kept). `lambda:resources` never applies a
recommendation server-side: a deploy from lambforge.yaml would set the yaml
values again, so it prints the `scaleOptions` lines instead.

Test: `npx jest --coverage=false test/cost-commands.spec.ts`.
