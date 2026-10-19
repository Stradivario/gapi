# lambforge-agent-skill (gcli slice)

**Canonical doc:** `gql-fission/docs/features/lambforge-agent-skill.md` ·
**Since:** 2026-10-19

The Lambforge agent skill (entry https://lambforge.com/skills/platform.md,
topic files next to it; source in gql-fission `src/skills/`) teaches AI
agents to drive this CLI. `cli.md` lists every command, and `platform.md`,
`deploy.md`, `events.md`, `clusters.md` and `agents.md` quote gcli exactly:

- install: `npm i -g @gapi/gcli` (or `npx @gapi/gcli`);
- login: the command from Profile -> CLI (`login --token --key --url
  --uploadUrl`), run by the human;
- `project:list` / `project:use`;
- `mcp:start` without `--url` (proxy to `<login url>/mcp`, token refresh on
  401/403) as the MCP server: `claude mcp add --scope user lambforge -- gcli mcp:start`;
- the `lambda:*`, `environment:*`, `cron:*`, `cluster:*`, `rabbitmq:*`,
  `plugin:*`, `build`, `start` commands and flags it lists.

**When you change any of those commands, flags or `mcp:start`, update
the skill files in gql-fission in the same change** - agents copy it verbatim.
README.md "AI agent skill" points users to it.
