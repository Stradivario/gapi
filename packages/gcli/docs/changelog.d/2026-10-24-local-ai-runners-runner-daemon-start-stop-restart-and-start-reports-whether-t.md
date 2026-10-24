## 2026-10-24 - local-ai-runners: runner:daemon:start / stop / restart, and start reports whether the runner stays up

**Feature:** local-ai-runners · **Type:** feat

Why: after `runner:daemon:install` there was no gcli way to start or stop the service (only raw `systemctl --user`), and a service whose token Lambforge refuses failed silently: `runner:daemon:status` showed `status=78` with no explanation of what to do.

- New commands (`src/commands/runner/index.ts`, `daemon-commands.ts`), all with `--service`:
  - `runner:daemon:start` and `runner:daemon:restart` run `systemctl --user start/restart`. After ~2 s, `reportStarted` reads `ActiveState`/`ExecMainStatus` (`SystemdUserService.outcome`) and reports:
    - running: says so;
    - exit 78 (`RUNNER_AUTH_EXIT_CODE`): the token was refused - the runner was deleted, or registered on another server than `~/.graphql-server/url` - with the hint to re-register via `gcli runner:daemon:install --reset`;
    - any other exit: points to `runner:daemon:logs`.
  - `runner:daemon:stop`: `systemctl --user stop`. The unit stays enabled and starts at the next login; `uninstall` removes it.
  - All three refuse with "not installed - run `gcli runner:daemon:install` first" when the unit file is missing.
- `SystemdUserService`: `installed()`, `start()`, `stop()`, `restart()`, `outcome()`.
- README, `README-CLI.md` (regenerated) and `docs/features/local-ai-runners.md` updated.
- **Test:**
  - `npx jest --coverage=false test/runner-daemon.spec.ts` covers: the systemctl calls, `installed()`, and the three `reportStarted` outcomes.
  - Live: `gcli runner:daemon:stop`, `gcli runner:daemon:start`, then `gcli runner:daemon:status`.
- **Debug:**
  - "did not stay up": `gcli runner:daemon:logs`.
  - "refused this runner's token": compare `~/.graphql-server/url` with the server the runner was registered on, then `runner:daemon:install --reset`.
- **Verification:**
  - jest: 11 suites, 103 tests pass (4 new). `tsc --noEmit` and eslint are clean.
  - `npm run build`: `--help` lists the new commands.
  - Not run against the real systemd unit.
