## 2026-10-19 - lambforge-agent-skill: README points to the Lambforge agent skill (gcli + mcp:start for AI agents)

**Feature:** lambforge-agent-skill · **Type:** docs

- README.md "AI agent skill" (under AI Integration): the prompt to paste into
  an agent (https://lambforge.com/skills/platform.md), the manual Claude Code
  install (every file from `files.txt`, `platform.md` copied to `SKILL.md`,
  `claude mcp add --scope user lambforge -- gcli mcp:start`), and what the
  topic files cover. The skill lives in gql-fission `src/skills/` (canonical
  doc there).
- `docs/features/lambforge-agent-skill.md`: which gcli commands the skill
  quotes - change them, update SKILL.md in the same change.
- **Test:** none (docs); the commands it lists were checked with
  `node release/index.js <command> --help`.
- **Debug:** an agent runs a gcli command that fails → compare SKILL.md with
  `gcli <command> --help`.
- **Verification:** no code change.
