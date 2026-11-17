import { IRabbitMq } from '~/@introspection';

/** The broker a queue or a trigger belongs to: by id or name, or the only
    broker of the project when none is named. */
export const resolveBroker = (
  brokers: IRabbitMq[] | null | undefined,
  wanted?: string,
): IRabbitMq => {
  const all = brokers ?? [];
  if (!all.length) {
    throw new Error(
      'no-broker: this project has no RabbitMQ broker (see rabbitmq:create)',
    );
  }
  if (!wanted) {
    if (all.length > 1) {
      throw new Error(
        `broker-needed: the project has ${all.length} brokers (${all
          .map((b) => b.name)
          .join(
            ', ',
          )}) - name one with --broker or \`broker:\` in lambforge.yaml`,
      );
    }
    return all[0];
  }
  const matches = all.filter((b) => b.id === wanted || b.name === wanted);
  if (!matches.length) {
    throw new Error(
      `broker-not-found: no broker "${wanted}" (see rabbitmq:list)`,
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `broker-ambiguous: ${matches.length} brokers are named "${wanted}" - use the id (see rabbitmq:list)`,
    );
  }
  return matches[0];
};

/** Queue names not on the broker yet, in the order asked, without repeats. */
export const queuesToDeclare = (broker: IRabbitMq, names: string[]) => {
  const existing = new Set((broker.queues ?? []).map((q) => q?.name));
  return [...new Set(names)].filter((name) => !existing.has(name));
};
