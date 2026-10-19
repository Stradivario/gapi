import {
  mergeOverExisting,
  toTriggerInput,
} from '~/commands/triggers/message-queue/save';

describe('mq-trigger flags', () => {
  it('maps create flags to the input and drops unset ones', () => {
    expect(
      toTriggerInput('create', {
        name: 'orders',
        lambda: 'api',
        requestTopic: 'orders',
        broker: 'b1',
        maxReplicas: '3',
      }),
    ).toEqual({
      name: 'orders',
      lambdaName: 'api',
      requestTopic: 'orders',
      rabbitMqId: 'b1',
      maxReplicaCount: 3,
    });
  });

  it('create needs a lambda and a request queue; update does not', () => {
    expect(() => toTriggerInput('create', { name: 'orders' })).toThrow(
      'needs --lambda and --request-topic',
    );
    expect(
      toTriggerInput('update', { name: 'orders', threshold: '10' }),
    ).toEqual({ name: 'orders', threshold: 10 });
  });

  it('refuses non-numeric counts', () => {
    expect(() =>
      toTriggerInput('update', { name: 'orders', maxRetries: 'many' }),
    ).toThrow('--max-retries must be a whole number');
  });

  it('update sends the current trigger with the given flags on top', () => {
    const existing = {
      id: '1',
      name: 'orders',
      lambdaName: 'api',
      requestTopic: 'orders',
      responseTopic: 'done',
      errorTopic: null,
      rabbitMqId: 'b1',
      maxReplicaCount: 2,
      threshold: 5,
    };
    expect(
      mergeOverExisting(existing, { name: 'orders', maxReplicaCount: 5 }),
    ).toEqual({
      name: 'orders',
      lambdaName: 'api',
      requestTopic: 'orders',
      responseTopic: 'done',
      rabbitMqId: 'b1',
      maxReplicaCount: 5,
      threshold: 5,
    });
    expect(() => mergeOverExisting(undefined, { name: 'nope' })).toThrow(
      'mq-trigger-not-found',
    );
  });
});
