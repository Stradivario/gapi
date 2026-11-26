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
recommendation server-side: a deploy from lambforge.yaml sets the yaml
values, so it prints the `scaleOptions` lines instead. Lambdas in `--auto`
keep their sized minCpu / minMemory through a deploy (server side,
`keepAutoSized` in graphql-server-lambdas).

Test: `npx jest --coverage=false test/cost-commands.spec.ts`.
