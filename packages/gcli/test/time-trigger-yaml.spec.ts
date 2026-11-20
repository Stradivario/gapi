import {
  storedTriggerName,
  timeTriggerPlan,
} from '../src/commands/lambda/helpers/time-trigger-sync';

describe('triggers.time sync (lambda:create / lambda:update)', () => {
  const want = { triggerName: 'every-10m', cron: '*/10 * * * *' };

  it('does nothing when the file has no triggers.time', () => {
    expect(
      timeTriggerPlan('tick', undefined, {
        triggerName: 'tick-x',
        cron: '* * * * *',
      }),
    ).toBe('none');
    expect(timeTriggerPlan('tick', { triggerName: 'x' }, null)).toBe('none');
  });

  it('creates the trigger when the lambda has none', () => {
    expect(timeTriggerPlan('tick', want, undefined)).toBe('create');
  });

  it('keeps a trigger with the same stored name and schedule', () => {
    const existing = {
      triggerName: storedTriggerName('tick', 'every-10m'),
      cron: '*/10 * * * *',
    };
    expect(existing.triggerName).toBe('tick-every-10m');
    expect(timeTriggerPlan('tick', want, existing)).toBe('same');
  });

  it('replaces when the name or the schedule differs (one trigger per lambda)', () => {
    expect(
      timeTriggerPlan('tick', want, {
        triggerName: 'tick-every-10m',
        cron: '*/5 * * * *',
      }),
    ).toBe('replace');
    expect(
      timeTriggerPlan('tick', want, {
        triggerName: 'tick-messaging',
        cron: '*/10 * * * *',
      }),
    ).toBe('replace');
  });
});
