## 2026-11-01 - dedicated-platform-cluster: cluster:cost prints amounts in the platform currency (no USD column)

**Feature:** dedicated-platform-cluster · **Type:** feat

- `gcli cluster:cost`: the USD column (totalCostUsd) is gone; amounts are
  plain numbers in the platform currency (`totalCost`,
  `estimatedMonthlyCost`), with a note.
- **Test:** `gcli cluster:cost --project <id>`.
- **Debug:** a missing column = an old gateway schema (restart it).
- **Verification:** tsc 0.
