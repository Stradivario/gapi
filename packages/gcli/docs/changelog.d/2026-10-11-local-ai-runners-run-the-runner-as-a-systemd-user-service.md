## 2026-10-11 - local-ai-runners: run the runner as a systemd user service

**Feature:** local-ai-runners · **Type:** feat

- `gcli runner:daemon:install` (alias `runner:start:daemon`) resolves or
  registers the runner first (gcli login session, or `--token` saved to the
  0600 `~/.graphql-server/runner.json`), then writes
  `~/.config/systemd/user/lambforge-runner.service` and runs
  `systemctl --user daemon-reload / enable / restart`. The unit runs
  `<node> <gcli script> runner:start --ollama <resolved URL>` (or the SEA
  binary), `Restart=always`, `RestartSec=5`, `WantedBy=default.target`.
  `runner:daemon:status`, `runner:daemon:logs` (journalctl -f) and
  `runner:daemon:uninstall` manage it; `--service` allows several,
  `--dry-run` prints the unit.
- Adapted from packages/cli-builder `SystemctlService`; differences: a user
  unit (no root, runs as the owner of runner.json), the token never goes
  into the unit, commands run via execFile (no shell), and
  `runner:start` now exits 78 on a refused token with
  `RestartPreventExitStatus=78` so systemd doesn't restart-loop. Warns when
  gcli runs from the npx cache and when lingering is off (stops at logout).
- Linux-only for now (clear error elsewhere).
- **Test:** `npx jest test/runner-daemon.spec.ts --coverage=false` (unit
  content/quoting, no token, command resolution incl. SEA and npx warning,
  the systemctl call sequence against a fake exec and a temp home).
  Manual: `gcli runner:start:daemon --dry-run`, then install,
  `systemctl --user status lambforge-runner`, reboot or log out/in.
- **Debug:** `gcli runner:daemon:logs` (= `journalctl --user -u
  lambforge-runner -f`); service "inactive (dead)" with status 78 = token
  refused -> `gcli runner:start --reset` then reinstall; stops at logout =
  `sudo loginctl enable-linger $USER`; ExecStart path gone = gcli was in the
  npx cache -> install globally and reinstall.
- **Verification:** gcli 38/38, tsc + eslint clean; `--dry-run` of the built
  CLI prints the expected unit. Not installed live on the dev machine. A
  first test version leaked a stub unit into the real ~/.config (home dir
  not injectable) - removed, and the service now takes the home dir
  explicitly.
