---
name: changelog
description: Record every code change as a feature-keyed changelog fragment in docs/changelog.d/ (node scripts/changelog.mjs new) and keep the feature's living doc in docs/features/ current. Use after ANY change to source, schema, config or behavior, and whenever you need the history of a feature to debug or extend it (node scripts/changelog.mjs render --feature <f>). Never edit docs/CHANGELOG.md directly.
---

# Feature changelog discipline

Two artifacts per feature, kept in the SAME commit as the change:

| Artifact | Holds | Edited how |
|---|---|---|
| `docs/features/<feature>.md` | Current state: what it does, architecture, files, config, how to test, how to debug, known limits | Updated in place - it must always describe what is true NOW |
| `docs/changelog.d/YYYY-MM-DD-<feature>-<slug>.md` | One change: what changed, how to test it, where to look when it breaks, what was verified | New file per change, never edited after merge |

`docs/CHANGELOG.md` is the archive - only `node scripts/changelog.mjs compact`
writes it (on the default branch, in its own commit).

## Workflow

```bash
node scripts/changelog.mjs features                         # existing feature slugs - reuse one
node scripts/changelog.mjs new local-ai-runners "model visibility per runner" --type feat
$EDITOR docs/changelog.d/2026-10-11-local-ai-runners-model-visibility-per-runner.md
$EDITOR docs/features/local-ai-runners.md             # bring the living doc up to date
node scripts/changelog.mjs check                            # must print OK
git add docs/ <changed files> && git commit
```

Starting work on an existing feature? Read its history first:

```bash
node scripts/changelog.mjs render --feature local-ai-runners
```

## Rules

- **Feature slug**: kebab-case, shared across the Lambforge repos
  (gql-fission, graphql-server, graphql-server-lambdas,
  graphql-server-functions, gcli) - a cross-repo feature uses the same slug
  in every repo it touches, and each repo's fragment mentions the others.
  `repo` is for changes owned by no feature (setup, tooling, deps).
- **New feature** = new `docs/features/<feature>.md` (outline in
  `docs/features/README.md`) + a row in that README's index. `check` fails
  without the doc.
- **Every entry has Test, Debug and Verification lines.** Test = how anyone
  can re-test it later. Debug = where to look when it breaks (log prefixes,
  collections, flags, failure modes). Verification = what YOU ran and saw.
- Say what is now true, not what you did ("runners heartbeat every 30s",
  not "edited connection.ts").
- One entry per logical change; several changes in a day = several files.
- Add `**Commit:** <hash>` when writing an entry after the fact.
- Not needed for: typo-only doc edits, scratch work, release/version bumps.

## Compaction

When `docs/changelog.d/` grows past ~20 files, on the default branch:
`node scripts/changelog.mjs compact` then
`git commit -m "docs(changelog): compact N entries"`. Never urgent;
`render --feature` reads fragments and archive alike.
