# repo-plan - gcli validate / plan / export (monorepo aware)

Plan: graphql-server `docs/plans/46-gcli-monorepo-plan-and-validate.md`.
Code: `src/commands/repo/`. Schema: `src/schema/lambforge.schema.json`
(published copy: gql-fission `src/schemas/lambforge.json` ->
`https://lambforge.com/schemas/lambforge.json` - **update both together**).

## Commands

| Command | Does | Network |
|---|---|---|
| `gcli validate [path] [--online]` | every `lambforge.yaml` against the schema + cross-file checks; exit 1 on errors | `--online`: introspects the live input types |
| `gcli plan [path] [-p] [--exit-code] [--json]` | per unit and section: `v` in sync, `~` change (field: now -> wanted), `+` missing, `x` error; then unmanaged lambdas | read-only queries |
| `gcli apply [path] [-p] [--yes] [--code] [--only <lambda>]` | the plan, a confirmation, then makes it true (see below); never deletes | writes |
| `gcli export <lambda> [-p] [-o file]` | a `lambforge.yaml` from a running lambda (function, environment, time trigger, domains) | read-only |

## How it works

- **Variants** (`unitsOfFile`, discover.ts): a file whose `!switch` /
  `!if` reads a variable (`CLUSTER_MODE`, `SUBSCRIPTIONS_ONLY`) is planned
  once per value (`switchVariables` in yaml-schema.ts finds them; `!if`
  gives the matching value and `false`/`true`). Each variant that makes a
  different `function.name` is its own unit (`unitKey` = folder +
  `VAR=value`), so cluster-worker and graphql-server-subscriptions are
  managed, not "unmanaged" (2026-11-25). A switch that changes only build
  options stays one unit. At most 16 combinations.

- **Discovery** (`discover.ts`): from the git root above `path`; skips
  `node_modules`, `.git`, `.gcache`, `dist`, `release` and `.gitignore`
  matches (the workspace `GitignoreMatcher`), depth 8. A unit = a folder
  with a `lambforge.yaml`. Without its own `environment:` a unit inherits
  the nearest parent's (owner decision: own wins). `own` = the file,
  `spec` = with inheritance.
- **Schema check** (`schema-check.ts`): a small JSON-Schema subset (type,
  enum, pattern (strings), required, properties, additionalProperties, patternProperties,
  items, $ref) - no ajv. Unknown keys are WARNINGS, wrong types / missing
  required keys ERRORS. Top-level keys starting with `.` (YAML anchors) are
  allowed. Cross checks (`validate.ts`): the same `function.name` / route
  on the same cluster twice = error; a `domains:` lambda no unit declares =
  warning.
- **Drift** (`drift.ts`, pure): only keys the file sets; lists as sets;
  `"20"` == `20`; a scaleOptions size/time of `0` = server default, not
  drift; environment fields the server did not return are skipped.
  Object fields (`environment.health`) compare by value (`normalized()`:
  null / `__typename` dropped, keys sorted).
- **Plan** (`plan.ts`): the project is read ONCE (lambdas with
  `listLambdasForPlan` - secret NAMES only, environments, time / mq
  triggers, domains), then `planUnit` per unit reuses `timeTriggerPlan` and
  `domainStep`. An inherited environment is planned only in the unit that
  owns it.
- **Export** (`export.ts`): `toYaml` is pure; an exported file validates
  clean and plans in sync (round-trip spec).

## Test

`npx jest test/repo-plan test/repo-apply test/repo-variants` (discovery + inheritance + skips, schema,
cross checks, drift, plan, export round trip).

## Debug

- A key flagged unknown that gcli does read: add it to the schema (both
  copies). `--online` names keys the live API lacks; gcli-only keys are in
  `GCLI_ONLY` (validate.ts).
- A false `~`: check how the live field reads in `FUNCTION_FIELDS`
  (drift.ts) - e.g. secrets are objects, envSecrets strings. Lists are
  true sets: production lambdas list some secret names 2-3 times
  (found 2026-11-25), which is not drift.

## gcli apply (`apply.ts`, decisions in `apply-work.ts`)

1. Plan as `gcli plan` (shared view `plan-view.ts`: units with work get
   their sections and `field: now -> wanted`; units in sync are one line;
   unmanaged lambdas one line). A plan with errors applies nothing.
2. Asks `Apply changes to N lambforge.yaml (M deploys)? [y/N]` on a
   terminal (`ui.confirm`); without one it stops and names `--yes`.
3. Order: environments (only in the unit that owns one), then per unit,
   in its own folder (`process.chdir` - a deploy reads build.sh, .gignore
   and the files next to its lambforge.yaml): the lambda deploy (the
   lambda:update flow in `embedded` mode, waiting for the build; it brings
   `triggers.time` and `domains:` along), else just the time trigger /
   domains that drifted; then `triggers.mq` (`applyMqTriggers`, shared with
   mq-trigger:apply).
4. **Build first**: before a deploy, `build:` of lambforge.yaml, else
   `npm run build` when package.json has a real `build` script (not an
   `echo` placeholder), runs in the unit folder with the variant's
   variables set (`inFolder` sets and restores them - the deploy re-reads
   lambforge.yaml with them too). Output only on failure (last 30 lines).
   `--no-build` deploys what is built. Variants sharing an environment
   apply it once.
5. `workFor` (pure): function missing = create, changes = update, in sync =
   nothing unless `--code`. A new lambda also gets its queue triggers.
6. Stops at the first failure (what ran stays applied), exit 1.

Code changes are not in the plan yet (no archive fingerprint on the
server), so `apply` redeploys code only with `--code` or when settings
changed.

## Not built yet

Code drift (an archive hash stored on the lambda), `cluster:` / `queues:`
in plan, `--prune` (would delete unmanaged lambdas - a separate decision).
