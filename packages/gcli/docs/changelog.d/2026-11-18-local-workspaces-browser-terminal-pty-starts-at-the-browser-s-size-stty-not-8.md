## 2026-11-18 - local-workspaces: Browser terminal PTY starts at the browser's size (stty), not 80 columns

**Feature:** local-workspaces · **Type:** fix

- The shell under `script` asked its PTY for the size (80x24), not COLUMNS:
  commands wrapped at 80 columns in a wide editor (seen in a cloud
  workspace). `shellCommand(size)` now runs `stty cols C rows R; exec shell
  -i` inside the PTY (linux `script -qfec`, macOS `script -q /dev/null
  /bin/sh -c`). The size comes from the browser, so `dimension()` lets only
  integers 10..1000 into the command line.
- Resize after start is still not passed (plan 36 follow-up).
- **Test:** `npx jest test/workspace-terminals.spec.ts --forceExit` (12).
- **Debug:** `stty size` in the terminal shows what the shell sees.
- **Verification:** 12/12, lint clean.
