# gcli - agent & teammate guide (start here)

`@gapi/gcli`, the Lambforge platform CLI (package `gapi/packages/gcli` in the
`gapi` monorepo): login, projects, lambdas (create/update/logs/test, specs,
`lambforge.yaml`), environments, private clusters, RabbitMQ, plugins, the
MCP proxy, the esbuild-based `build`/`start`, and the local AI runner
(`runner:*`). TypeScript, commander, rxjs; bundled by esbuild into
`release/index.js` (also shipped as a Node SEA binary).

## The Lambforge platform (sibling repos)

Lambforge is a serverless-on-Kubernetes platform (lambdas on a Fission fork,
private Talos clusters, AI chat/agents, billing). The repos live side by
side in `reactive-solutions/`; each has its own `AGENTS.md`.

| Repo | Role |
|---|---|
| `gql-fission` | Frontend SPA (Lit + @rxdi/@rhtml, Parcel, Apollo) - talks only to the gateway (+ `/subscriptions` WS) |
| `graphql-server-federated` | Apollo federation gateway (dev :9004): verifies Firebase/CI tokens, forwards the user as a `user` header, composes subgraphs at startup |
| `graphql-server` | Main subgraph: users, teams, projects, billing, AI chat & agents, MCP server, local AI runners; hosts `/subscriptions` (dev :9000, RabbitMQ pub/sub) |
| `graphql-server-lambdas` | Lambdas/Fission, environments, secrets/configs, RabbitMQ, plugins, private clusters (multi-cluster), Atlas connector |
| `graphql-server-functions` | Monorepo of Fission lambdas: cluster-provisioner, billing/cost scrapers, invoices, code-runner, gateway-federation, mcp, ... |
| `gapi/packages/gcli` | `gcli` CLI: login, lambdas, environments, clusters, MCP proxy, local AI runner |
| `graphql-server-common` | Shared Mongoose models (`@stradivario/graphql-server-models`) |

**Cross-repo features use one feature slug everywhere** (e.g.
`local-ai-runners`): one canonical `docs/features/<slug>.md` in the repo
that owns most of it, a short slice doc in each other repo, and a changelog
fragment in every repo the change touches.

## Project skills (`.agents/skills/`, mirrored at `.claude/skills`)

| Skill | Owns |
|---|---|
| `gcli-command` | Adding a command: registration, lazy actions, `GraphqlClienAPI`, tests, build/release, regenerating `README-CLI.md` |
| `cluster-targeting` | Commands touching resources that can live on a private cluster (`--clusterId/--clusterName`) |
| `local-ai-runners` | `runner:*` - the outbound WS client bridging a user's Ollama to the chat (its `TunnelConnection` base also serves `workspace:*`) |
| `changelog` | Feature-keyed changelog fragments + feature docs |

## Documentation map

| You need... | Read |
|---|---|
| User guide (every command, `lambforge.yaml`, MCP, build) | [`README.md`](README.md) |
| Generated `--all-help` output | [`README-CLI.md`](README-CLI.md) (regenerate, don't edit) |
| Features (current state) | [`docs/features/README.md`](docs/features/README.md) |
| Change history of a feature | `node scripts/changelog.mjs render --feature <slug>` |
| Local AI runner (slice; canonical in graphql-server) | [`docs/features/local-ai-runners.md`](docs/features/local-ai-runners.md) |
| Local workspaces - `workspace:*` (slice; canonical in graphql-server) | [`docs/features/local-workspaces.md`](docs/features/local-workspaces.md) |
| Claude Code config in this package | [`.claude/README.md`](.claude/README.md) |

## Key patterns

- Commands: `src/commands/<area>/index.ts` registers `<area>:<verb>` with a
  lazy `import('./<verb>')` action; register the area in
  `src/commands/index.ts`.
- API: `GraphqlClienAPI.query` (`src/services/gql-client.ts`) talks to the
  gateway as the `gcli login` user (token refreshed after 30 min). Login
  state: `~/.graphql-server/` (paths in `src/types.ts`).
- `release/index.js` is COMMITTED and rewritten by every `npm run build` -
  restore it (`git checkout -- release/index.js`) unless you are releasing.
- `README-CLI.md` = `node release/index.js --all-help` output.

## Running & testing

```bash
npx jest --coverage=false        # test/*.spec.ts (jest maps ~/, @introspection/, @commands/)
npx tsc --noEmit -p .
npx eslint --fix <files>
npm run build                    # -> release/index.js
node release/index.js <command> --help
npm run patch                    # release: build, version bump, publish
```

CI (repo root `.github/workflows/`): **Tests** runs on every push to a
non-master branch - `npx @rxdi/bolt install`, then `npm run lint` and
`npm test` across all gapi workspaces (gcli included). **Publish** repeats
lint/test on master before publishing; **Release GCLI Binary** builds the
SEA binary on `v*` tags. Reproduce Tests locally from the repo root:
`npm run lint && npm test`.

## Docs, skills and changelog - same change, every time

This repo is documentation-driven. With every change:

1. **Changelog fragment** - `node scripts/changelog.mjs new <feature> "<summary>"`
   -> fill in what changed + **Test** + **Debug** + **Verification** ->
   `node scripts/changelog.mjs check`. Never edit `docs/CHANGELOG.md` (archive).
   Details: the `changelog` skill, `docs/changelog.d/README.md`.
2. **Feature doc** - keep `docs/features/<feature>.md` true (new feature =
   new doc + a row in `docs/features/README.md`).
3. **Skills / AGENTS.md** - learned something non-obvious, or a workflow
   bit you? Update the owning skill (`.agents/skills/<name>/SKILL.md`) or
   this file in the same change.
4. **User docs + What's new** - a change users can see or do also updates
   gql-fission's public docs page (`gql-fission/src/docs/<slug>.md`) and adds a
   line to `gql-fission/src/app/changelog/releases.ts`. Skill:
   `user-docs-and-changelog` in gql-fission.

Before working on an existing feature: `node scripts/changelog.mjs render
--feature <slug>` + its feature doc. That is where "how to test" and "how
to debug" live.

## Pitfalls

- `gcli login` overwrites `~/.graphql-server/url`: logging into a dev
  gateway points every later command (and `runner:start`) at dev.
- Jest needs the `moduleNameMapper` in `jest.config.js` for the `~/` alias -
  without it any spec importing command code fails to resolve.
- `runner:start` and `workspace:start` need Node >= 22 (global `WebSocket`).
