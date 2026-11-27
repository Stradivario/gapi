## 2026-11-27 - local-workspaces: terminal output without a 40 ms wait before every echo

**Feature:** local-workspaces · **Type:** feat

- Terminal output leaves at once when nothing is in flight (no fixed 40 ms window before every echo) and is batched only while a send is on its way: `sendWhileIdle` (commands/workspace/send-while-idle.ts) replaces bufferTime(40) + concatMap. Same pattern as the browser's keystrokes.
- **Test:** `npx jest --coverage=false test/send-while-idle.spec.ts`.
- **Debug:** echo latency = browser send + relay + this send; nothing waits on a timer now.
- **Verification:** 283 tests.
