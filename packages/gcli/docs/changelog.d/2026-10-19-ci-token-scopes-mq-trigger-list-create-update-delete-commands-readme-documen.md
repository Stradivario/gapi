## 2026-10-19 - ci-token-scopes: mq-trigger:list/create/update/delete commands; README documents CI token permissions per command

**Feature:** ci-token-scopes · **Type:** feat

- New `mq-trigger:list`, `mq-trigger:create`, `mq-trigger:update`,
  `mq-trigger:delete` (`src/commands/triggers/message-queue/`) - message-queue
  triggers had an API and a dashboard page but no CLI. Flags: `--name`,
  `--lambda`, `--request-topic`, `--response-topic`, `--error-topic`,
  `--broker` (RabbitMQ id), scaling counts; `update` reads the current
  trigger and sends it with the passed flags on top (the service needs the
  full spec).
- README: CI/CD section lists the permission each command needs (CI token
  scopes now cover every project command, incl. clusters for DevOps
  tokens) and a Message-Queue Triggers section; `README-CLI.md`
  regenerated from the built CLI's `--help`.
- **Test:** `npx jest test/mq-trigger.spec.ts` (flag mapping, create needs
  lambda + queue, numbers validated, update merged over the current trigger).
- **Debug:** `docs/features/ci-token-scopes.md`; `ci-token-missing-scope`
  comes from the services - reissue the token with that permission.
- **Verification:** jest 75/75; tsc clean; `gcli mq-trigger:create --help`
  from a fresh build; `release/index.js` restored after the build.
