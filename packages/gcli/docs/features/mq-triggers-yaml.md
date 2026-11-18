# mq-triggers-yaml

**Status:** built 2026-11-17 (plan 34 step 5: the first lambda that declares
its queues and its queue trigger in `lambforge.yaml`). Not released yet.

## What it is

- `queue:declare` - declares queues on a broker of the project. Names from
  `-n` (repeatable) or `queues.declare` in `lambforge.yaml`; `--broker` /
  `queues.broker` is a broker name or id, optional with one broker. Durable,
  not auto-delete. A queue the broker already has is skipped, so it can run
  on every deploy. (`declareQueue` existed in the API and MCP only.)
- `mq-trigger:apply` - reads `triggers.mq` (a list) and creates the missing
  triggers, updates the others (same merge as `mq-trigger:update`). `lambda`
  defaults to the file's `function.name`; the broker is resolved to its id.
  Never deletes.
- yaml schema: `QueuesConfig`, `MqTriggerConfig` in
  `src/commands/lambda/helpers/load-spec.ts`.

## Where

| What | File |
|---|---|
| broker by name / id / the only one; queues still missing | `src/commands/rabbitmq/resolve-broker.ts` |
| `queue:declare` | `src/commands/rabbitmq/declare-queue.ts` |
| `mq-trigger:apply` | `src/commands/triggers/message-queue/apply.ts` |
| `declareQueue` mutation | `src/services/gql-client.ts` |

## How to test

`npx jest --coverage=false test/queue-and-mq-trigger-yaml.spec.ts
test/mq-trigger.spec.ts`. Live: `gcli rabbitmq:list`, `gcli queue:declare -n
<q>`, `gcli mq-trigger:apply` in a folder with a `lambforge.yaml`.

## Not in it

- Connector concurrency per trigger (the connector takes 10 messages at
  once by default) - needs a field in the API first.
- Deleting queues / triggers that left the yaml.
