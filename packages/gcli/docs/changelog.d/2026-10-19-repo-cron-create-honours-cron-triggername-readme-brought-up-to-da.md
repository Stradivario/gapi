## 2026-10-19 - repo: cron:create honours --cron/--triggerName; README brought up to date with every command

**Feature:** repo · **Type:** fix

- `cron:create` declared `--cron` and `--triggerName` but only read them
  from the spec (`triggers.time` of lambforge.yaml / cron.yaml), so the
  documented `gcli cron:create --lambdaName x --triggerName nightly --cron
  '0 2 * * *'` sent an empty schedule. Flags now win, the spec fills gaps,
  and a missing schedule is a clear error before any request.
- README: binary install from `releases/latest` (was pinned to v1.8.198);
  `environment:update/delete`, `lambda:list` and a "Schedules (cron)"
  section (the commands were missing); `triggers:` in the unified
  lambforge.yaml; the MCP client URL is `https://<host>/<projectId>/<route>`
  (the `/mcp` suffix was wrong - see example/mcp/lambforge.yaml); the
  declarative cluster section. Every command registered in `src/commands`
  now appears in README.md.
- **Test:** `npx jest --coverage=false test/cron-create.spec.ts` (flags,
  flags over yaml, missing schedule).
- **Debug:** a cron with an empty schedule → an older gcli; upgrade.
- **Verification:** jest 71/71; a script compared the commands registered in
  `src/commands` against README.md (no command missing).
