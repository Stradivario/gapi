## 2026-11-17 - mq-triggers-yaml: queue:declare, mq-trigger:apply and queues / triggers.mq in lambforge.yaml

**Feature:** mq-triggers-yaml · **Type:** feat

- `queue:declare` (new): declares queues on a broker of the project, from
  `-n` (repeatable) or `queues.declare` in `lambforge.yaml`; skips queues
  the broker already has. `GraphqlClienAPI.declareQueue`,
  `commands/rabbitmq/declare-queue.ts`, `resolve-broker.ts` (broker by
  name, id, or the only one).
- `mq-trigger:apply` (new): creates or updates the triggers listed under
  `triggers.mq` in `lambforge.yaml`; `lambda` defaults to `function.name`.
  `commands/triggers/message-queue/apply.ts`.
- `lambforge.yaml` schema: `queues: { broker?, declare[] }` and
  `triggers.mq[]` (`load-spec.ts`). README: both commands, the yaml, and
  how a message is acknowledged. `README-CLI.md` regenerated.
- **Test:** `npx jest --coverage=false
  test/queue-and-mq-trigger-yaml.spec.ts` (9 tests: broker resolution,
  queues to declare, yaml -> input, create vs update).
- **Debug:** `broker-needed` = several brokers and none named;
  `broker-not-found` / `broker-ambiguous` = check `rabbitmq:list`;
  `queue-exists-with-this-name` from the API = the queue is on the broker
  but `rabbitmq:list` was stale.
- **Verification:** jest 13/13 on the two specs, `tsc --noEmit` clean; the
  built CLI ran `queue:declare --help`, `rabbitmq:list` and
  `mq-trigger:list` against prod (read-only). `queue:declare` and
  `mq-trigger:apply` were not run against a real broker yet.
