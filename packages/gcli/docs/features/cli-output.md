# cli-output - how gcli talks to people

One output vocabulary for every command (`src/services/ui.ts`, no
dependency - `node:util` `styleText`):

```
=== Deploying api to project shop

✔  lambda[api]: archive packed (4 files, 31 KB) 0.4s
✔  lambda[api]: archive uploaded (31 KB) 0.7s
✔  lambda[api]: lambda saved 0.5s
✔  lambda[api]: built and live 12s
⚠  domains: shop.example.com not applied - run gcli domain:apply

✔  Deploy complete!

URL:   https://...
Logs:  gcli lambda:logs --name api
```

| Call | Prints |
|---|---|
| `ui.header(t)` | `=== t` (bold, blank line around) |
| `ui.info / success / warn / error(msg, scope?)` | `i` / `✔` / `⚠` / `✖` + `scope:`; warn + error on stderr; lines after the first indented |
| `step(label, { scope, done })` | operator: `i scope: label...` (a spinner on a terminal) -> `✔ scope: <done> 1.2s`, or `✖ scope: label failed` |
| `ui.spin(text, scope)` | a spinner you update yourself (`update`, `stop`) |
| `ui.done(t)` + `ui.summary([[label, value]])` | the closing line and aligned `Label:  value` rows |
| `ui.table(rows, columns?)` | aligned columns, dim upper-case header, `-` for empty, cells clipped at 60 |
| `ui.print(t)` | plain text: data, logs, JSON |

- **Colour** only on the symbol and the scope, the message stays plain.
  On when the stream is a terminal; `NO_COLOR` turns it off, `FORCE_COLOR`
  (`0` = off) wins over both. Never escape codes in a pipe or a file.
- **Spinner** only on an interactive terminal outside CI (`CI` set = one
  plain line per step). Lines printed while it spins clear it and it is
  redrawn below them.
- **Unicode** symbols except on old Windows consoles (`√ ‼ ×` there).
- **`--json`** (lambda:create / lambda:update): progress goes to stderr,
  stdout carries only the saved lambda as JSON.
- `Logger` (`src/services/log.ts`) is the old entry point, kept for the
  ~350 existing calls and rendered through `ui`: `log` = plain text,
  `info` / `success` / `warn` / `error` = symbol lines, `table` = `ui.table`.
  JSON text given to `info` is printed as is (it is data). The
  `-----` / `[Action][x]` banners are gone.
- Errors: `errorText()` turns an Error / GraphQL error list / string into
  text (`GCLI_DEBUG=1` adds the stack). `ReportedError` (helpers.ts) = the
  command already explained the failure: exit with its code, print nothing
  more.

## lambda:create / lambda:update

Steps: packing archive -> uploading archive -> saving lambda -> **waiting
for the build and rollout** -> time trigger -> domains -> `Deploy complete!`
with URL / Site / Logs.

- Waiting: an update that needed a new build answers `deployStatus:
  DEPLOYING` and turns `LIVE` / `FAILED` when rolled out
  (graphql-server-lambdas `completeDeferredLambdaUpdate`); gcli polls
  `getLambda(deployStatus)` every 3 s. A new lambda is followed through
  `getLambdaBuildStatus`. An update without a new build is LIVE at once.
- Failed: `✖ the deploy failed`, the build log tail, the `lambda:logs-builder`
  command, exit code 1 (CI fails on a broken build now).
- Live but with build or runtime errors in the logs: a `⚠` with them.
- After 15 minutes, or when the status cannot be read (older API): a `⚠`
  with the logs command, and the deploy carries on.
- `--no-wait` returns once saved (the old behaviour).

Test: `npx jest test/ui.spec.ts`. Look: run any command in a terminal and
piped (`| cat`) - the pipe must show no escape codes and no spinner frames.

## cluster:health / cluster:status as a dashboard (2026-11-26)

`src/commands/cluster/helpers/health-view.ts` (pure, every function returns
lines): `headerLine` (`name  ● overall  size · agent · 12s ago`, the dot in
the overall's colour), `meterLines` (label, a 20-cell bar in eighths of a
cell `▏▎▍▌▋▊▉█`, percent, "2.7 of 6 CPU", `(host)` when a virtual
cluster's usage comes from its host), `podsLine`, `nodeLines` (a bar per
node against its own capacity; a node of a cluster measured against its
size - a vCluster's stand-in nodes - shows only its amount), `issueLines`
(`✖` / `⚠` / `i` + the overview's message). Bar colours follow the web
meters: green, yellow from 70 %, red from 85 %. No unicode = `#` / `-`
bars; no colour (pipe, NO_COLOR) = plain text.

- `cluster:health`: ONE request (`GraphqlClienAPI.clusterHealthView`:
  `projectClustersOverview` + `clusterHealth(limit: 1)`). `--watch
  [seconds]` (default 30 = the heartbeat, at least 5) redraws with
  `ui.redraw` - the screen is cleared on an interactive terminal, each frame
  appended in a pipe/CI; a failed refresh is a `⚠` and the next tick tries
  again. `--json` = `{ overview, latest }` on stdout.
- `cluster:status`: `statusView` - per cluster the header and two compact
  bars (requested, with used next to it) plus its issues; `--json` = the
  overview list. `overviewRow` (the old table row) stays exported.
- Totals come from `health.capacity` (cluster-provisioner 2026-11-26:
  min(nodes, the cluster's size)).

Test: `npx jest test/cluster-health-view.spec.ts`. Look: `gcli cluster:health
--cluster <id>` in a terminal, then `| cat` (no escape codes).
