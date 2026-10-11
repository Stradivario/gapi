---
name: gcli-command
description: Add or change a gcli command (commander registration, lazy action modules, GraphqlClienAPI calls through the gateway, Logger output, tests, build/release, regenerating README-CLI.md). USE BEFORE adding a `gcli <area>:<verb>` command or a new API call in src/services/gql-client.ts.
---

# Adding a gcli command

## Shape

```
src/commands/<area>/index.ts     registerXCommands(program): .command('<area>:<verb>')
                                 .description(...).option(...)
                                 .action(lazy(() => import('./<verb>').then(m => m.default)))
src/commands/<area>/<verb>.ts    export default (cmd: { ...options }) => Promise<...>
src/commands/index.ts            add registerXCommands to `commands`
```

- Actions are lazy-imported - keep heavy imports inside the action module.
- Return a promise (`lastValueFrom(observable)` for rxjs flows); throw an
  `Error` with an actionable message (`Run gcli login first`, `--id ...`).
- Output via `Logger` (`src/services/log.ts`: log/info/warn/error/table).

## API calls

`GraphqlClienAPI.query<T>({ query: gql`...`, variables })` in
`src/services/gql-client.ts`: POSTs to the `gcli login` URL with the stored
Firebase token (auto-refreshed after 30 min) - i.e. through the federation
gateway as the logged-in user. Selection sets are plain strings in
`src/services/types/*.fragment.ts`. Response types: `@introspection/index`
(regenerated with `npm run introspect` against a live gateway) or a local
interface next to the command (as `commands/runner/types.ts`).

Login state lives in `~/.graphql-server/` (`token`, `refresh`, `url`, `key`,
`project`, ...; paths in `src/types.ts`). A command needing its own state
adds a path there (the runner stores `runner.json`, mode 0600).

Project/cluster-scoped commands: `parseProjectId(cmd.project)`,
`resolveClusterId` in `src/helpers.ts`; see the `cluster-targeting` skill.

## Tests, build, docs

```bash
npx jest --coverage=false            # test/*.spec.ts; jest maps ~/ @introspection/ @commands/
npx tsc --noEmit -p .
npx eslint --fix <files>
npm run build                        # esbuild -> release/index.js (committed!)
node release/index.js <area>:<verb> --help
```

- Mock the API in specs: `jest.mock('../src/services/gql-client', ...)`.
- `release/index.js` is committed and rewritten by every build - don't
  commit it from a feature branch unless releasing (`git checkout -- release/index.js`).
- `README-CLI.md` is generated: `node release/index.js --all-help > README-CLI.md`
  after a build. User-facing docs: a section in `README.md`.
- Changelog fragment + feature doc (`changelog` skill).
