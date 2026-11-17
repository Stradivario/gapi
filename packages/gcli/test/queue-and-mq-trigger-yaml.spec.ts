import {
  queuesToDeclare,
  resolveBroker,
} from '~/commands/rabbitmq/resolve-broker';
import {
  applyMode,
  yamlTriggerInput,
} from '~/commands/triggers/message-queue/apply';

const broker = (id: string, name: string, queues: string[] = []) => ({
  id,
  name,
  queues: queues.map((q) => ({ name: q })),
});

describe('resolveBroker', () => {
  it('takes the only broker when none is named', () => {
    expect(resolveBroker([broker('1', 'main')]).id).toBe('1');
  });

  it('finds a broker by name or by id', () => {
    const all = [broker('1', 'main'), broker('2', 'jobs')];
    expect(resolveBroker(all, 'jobs').id).toBe('2');
    expect(resolveBroker(all, '1').name).toBe('main');
  });

  it('asks for a name when the project has several', () => {
    expect(() =>
      resolveBroker([broker('1', 'main'), broker('2', 'jobs')]),
    ).toThrow('broker-needed');
  });

  it('refuses a missing or ambiguous broker, and a project without one', () => {
    expect(() => resolveBroker([broker('1', 'main')], 'nope')).toThrow(
      'broker-not-found',
    );
    expect(() =>
      resolveBroker([broker('1', 'main'), broker('2', 'main')], 'main'),
    ).toThrow('broker-ambiguous');
    expect(() => resolveBroker([])).toThrow('no-broker');
  });
});

describe('queuesToDeclare', () => {
  it('skips queues the broker already has and repeated names', () => {
    expect(
      queuesToDeclare(broker('1', 'main', ['jobs']), [
        'jobs',
        'jobs-success',
        'jobs-success',
        'jobs-error',
      ]),
    ).toEqual(['jobs-success', 'jobs-error']);
  });
});

describe('triggers.mq in lambforge.yaml', () => {
  it('maps an entry to the API input: lambda from the file, broker as id', () => {
    expect(
      yamlTriggerInput(
        {
          name: 'jobs',
          requestTopic: 'jobs',
          responseTopic: 'jobs-success',
          errorTopic: 'jobs-error',
          maxRetries: 2,
          minReplicas: 0,
          maxReplicas: 1,
        },
        { lambda: 'worker', brokerId: 'b1' },
      ),
    ).toEqual({
      name: 'jobs',
      lambdaName: 'worker',
      requestTopic: 'jobs',
      responseTopic: 'jobs-success',
      errorTopic: 'jobs-error',
      rabbitMqId: 'b1',
      maxRetries: 2,
      minReplicaCount: 0,
      maxReplicaCount: 1,
    });
  });

  it("an entry's own lambda wins; no lambda at all is refused", () => {
    expect(
      yamlTriggerInput(
        { name: 'jobs', requestTopic: 'jobs', lambda: 'other' },
        { lambda: 'worker' },
      ).lambdaName,
    ).toBe('other');
    expect(() =>
      yamlTriggerInput({ name: 'jobs', requestTopic: 'jobs' }, {}),
    ).toThrow('no lambda');
  });

  it('needs a name and a request queue', () => {
    expect(() =>
      yamlTriggerInput({ name: 'jobs' } as never, { lambda: 'worker' }),
    ).toThrow('`name` and `requestTopic`');
  });

  it('creates a new trigger and updates an existing one', () => {
    const existing = [{ name: 'jobs' }] as never;
    expect(applyMode(existing, 'jobs')).toBe('update');
    expect(applyMode(existing, 'other')).toBe('create');
  });
});
