## 2026-10-11 - repo: AI-ready package setup - AGENTS.md, skills, feature-keyed changelog

**Feature:** repo · **Type:** repo

- `AGENTS.md` (canonical guide for this package) + thin `CLAUDE.md`;
  skills in `.agents/skills/` (`cluster-targeting` moved there, new
  `gcli-command`, `local-ai-runners`, `changelog`) with `.claude/skills`
  symlink; feature-keyed changelog (`docs/changelog.d/`,
  `scripts/changelog.mjs`) and `docs/features/`.
- `README.md`: new "Local AI Models (Ollama runner)" section.
  `README-CLI.md` regenerated from `--all-help` - it was missing the cron,
  cluster, rabbitmq, plugin and `lambda:package` commands.
- `jest.config.js` maps the tsconfig path aliases (`~/`, `@introspection/`,
  `@commands/`) - specs importing command code could not resolve before.
- **Test:** `node scripts/changelog.mjs check`; `npx jest --coverage=false`.
- **Debug:** spec fails with "Cannot find module '~/...'" -> the
  `moduleNameMapper` was lost.
- **Verification:** `check` OK; jest 27/27.
