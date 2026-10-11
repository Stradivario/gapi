# Features

Living docs, one per feature (current state). The change history of a
feature is in `docs/changelog.d/` - `node scripts/changelog.mjs render --feature <slug>`.

## Writing a feature doc

One file per feature, `docs/features/<feature>.md`, named by the same
kebab-case slug the changelog uses (`node scripts/changelog.mjs features`). It
describes what is true NOW - history goes in `docs/changelog.d/`
(`node scripts/changelog.mjs render --feature <feature>`). Update it in the same
commit as the change. A feature spanning several repos has ONE canonical doc
(in the repo that owns most of it) and a short slice doc in each other repo
that links to it.

Outline (drop sections that don't apply):

1. **Header** - status + date, feature slug, one paragraph: what the user gets.
2. **How it works** - the flow, end to end; a small diagram if it helps.
3. **Files** - where each part lives (path -> responsibility).
4. **Config / limits** - env vars, timeouts, quotas, entitlements.
5. **How to test** - exact commands/specs, plus manual steps for what has
   no automated coverage.
6. **How to debug** - symptom -> where to look (log prefixes, collections,
   flags). This is the section future-you will need most.
7. **Security model** - who can do what, what is validated where.
8. **Known limits / next steps.**

## Features

| Feature | Doc | Notes |
|---|---|---|
| `local-ai-runners` | [local-ai-runners.md](local-ai-runners.md) | `runner:*` commands; canonical doc in graphql-server |
