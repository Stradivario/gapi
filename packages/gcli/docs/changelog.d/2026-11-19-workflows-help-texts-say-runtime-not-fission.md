## 2026-11-19 - workflows: help texts say runtime, not Fission

**Feature:** workflows · **Type:** fix

- Owner rule: shown text never names Fission. `workflow:trigger:add`
  ("Needs runtime 1.26+ on the cluster") and the `cluster:create` virtual
  cluster option ("own Kubernetes API + the Lambforge runtime") said
  Fission in `--help`.
- **Test:** `node release/index.js workflow:trigger:add --help` after a build.
- **Debug:** grep `Fission` in `src/commands/*/index.ts` descriptions.
- **Verification:** grep: no Fission left in descriptions or printed
  messages (type names only). Not released.
