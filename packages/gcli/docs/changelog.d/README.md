# Changelog fragments (by feature)

One file per change: `YYYY-MM-DD-<feature>-<slug>.md`, each a complete entry
in the template below. Create one with

    node scripts/changelog.mjs new <feature> "<summary>" [--type feat|fix|perf|refactor|test|docs|tooling|repo]

fill in every `<...>` placeholder, run `node scripts/changelog.mjs check`, and
commit it **together with the change**.

The tool is plain Node (>= 18, no dependencies - runs in any Node
container, no Python needed); `npm run changelog -- <command> ...` is an
alias.

Why this shape:

- **Fragments, not one file** - two branches prepending to the same
  `CHANGELOG.md` conflict on every rebase; two new files never do.
  `docs/CHANGELOG.md` is the archive and is written only by
  `node scripts/changelog.mjs compact` (default branch, own commit).
- **Keyed by feature** - every entry names its feature (`**Feature:**`), and
  each feature has a living doc in `docs/features/<feature>.md` (`check`
  enforces it). `node scripts/changelog.mjs render --feature <f>` prints the whole
  history of one feature, archive included - the starting point when you
  need to debug or extend it later. `node scripts/changelog.mjs features` lists
  them all.
- **Test / Debug / Verification are mandatory** - an entry records how to
  test the change and where to look when it breaks, not just what changed.

Use the feature `repo` for changes that belong to no single feature (repo
setup, tooling, dependency bumps). The same feature slug is used across the
Lambforge repos (gql-fission, graphql-server, graphql-server-lambdas,
graphql-server-functions, gcli), so a cross-repo feature reads the same
everywhere.

## Template

```markdown
## YYYY-MM-DD - <feature>: <one-line summary>

**Feature:** <feature> · **Type:** feat | fix | perf | refactor | test | docs | tooling | repo

- What is now true and why - one bullet per logical change; name the
  files/modules that own it. Mention the sibling-repo halves of a
  cross-repo change.
- **Test:** the specs/commands to run and what passing looks like; manual
  steps if there is no automated coverage.
- **Debug:** where to look when it breaks - log prefixes, collections,
  env flags, likely failure modes and their symptoms.
- **Verification:** what was actually run for this change and its result.
```
