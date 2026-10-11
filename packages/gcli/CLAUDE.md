# Claude Code entry point

The canonical agent/teammate guide is AGENTS.md - imported below so it loads
into every session automatically. AGENTS.md (not this file) is where content
lives: it is the tool-agnostic standard that other agents and editors read
too. Keep this file a thin loader; never duplicate guidance here.

@AGENTS.md

## Claude-specific notes

- Project skills auto-load from `.claude/skills` (a symlink to
  `.agents/skills` - edit skills THERE, one source of truth). Invoke with
  `/<name>`; the table is in AGENTS.md.
- Documentation-driven: every change ships with a changelog fragment
  (`node scripts/changelog.mjs new <feature> "<summary>"`, then `check`) and an
  up-to-date `docs/features/<feature>.md`. Learned something non-obvious?
  Update the owning skill or AGENTS.md in the same change.
- Before touching an existing feature, read its history:
  `node scripts/changelog.mjs render --feature <slug>`.
