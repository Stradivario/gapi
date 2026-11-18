## 2026-11-18 - local-workspaces: One-way terminal input + resize frames: typing never waits for a round trip

**Feature:** local-workspaces · **Type:** feat

- Tunnel frames `input` ({ sessionId, data }) and `resize` ({ sessionId,
  cols, rows }) next to `approval`: handled in `WorkspaceConnection
  .onTerminalNotice`, no reply. Before, every keystroke batch was a full
  request/response to this machine (~400 ms through the free sandbox) and
  the browser queued them. The backend sends these frames only to gcli
  >= 1.8.273 (older ones get the request/response `terminal/input`).
- `TerminalManager.resize`: the shell's PTY (`/proc/<pid>/fd/0` on linux,
  `ps -o tty=` on macOS) gets `stty -F <pts> cols C rows R`; the kernel sends
  SIGWINCH. Only with a PTY (`script`); never throws.
- **Test:** `npx jest test/workspace-terminals.spec.ts --forceExit` (14):
  real shell opens at 30x100, resize -> `stty size` = 40 150.
- **Debug:** `stty size` in the browser terminal; a frame for a closed
  session is dropped silently.
- **Verification:** 14/14, lint clean.
