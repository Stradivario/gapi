# .claude/ - Claude Code configuration for this repo

| Path | Committed? | Purpose |
|---|---|---|
| `skills` | yes (symlink) | -> `../.agents/skills`, the single source of truth for project skills. Edit skills THERE. |
| `settings.json` | yes, if present | Team-wide baseline (permissions, hooks) |
| `settings.local.json` | no (gitignored) | Your personal overrides for this repo |
| `worktrees/`, `scheduled_tasks.lock` | no (gitignored) | Ephemeral Claude Code state |

Related at the repo root: `AGENTS.md` (the canonical agent guide - tool
agnostic, read by other agents/editors too), `CLAUDE.md` (a thin loader that
imports AGENTS.md), `.mcp.json` (project MCP servers, if present).

## How settings layer

`~/.claude/settings.json` (you, all projects) -> `.claude/settings.json`
(this repo, team) -> `.claude/settings.local.json` (this repo, just you).
Scalars: later wins. Permission arrays merge, and a `deny` in any layer
beats an `allow` elsewhere - so you can always tighten locally:

```json
{ "permissions": { "ask": ["Bash(git push*)"], "deny": ["Read(./.env)"] } }
```

## Skills

A skill is `.agents/skills/<name>/SKILL.md`: YAML frontmatter (`name`,
`description` - the description is what decides when it auto-loads, so say
WHEN to use it) and then the checklist. Invoke with `/<name>`. When a
workflow proves itself or bites someone, update or add a skill in the same
change - same rule as docs.

Reference: https://docs.claude.com/en/docs/claude-code/settings
