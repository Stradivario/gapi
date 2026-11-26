import { toAutoscaleInput } from '../src/commands/cluster/autoscale';
import {
  parseDays,
  pluginResources,
  recommendationRow,
  toHibernationInput,
  yamlSnippet,
} from '../src/commands/cost/parse';

const part = (current: number, recommended: number, action: string) => ({
  current,
  recommended,
  action: action as 'raise',
  typical: 10,
  peak: 20,
  note: null,
});

describe('plan 50 cost commands', () => {
  it('days: names, ranges and numbers', () => {
    expect(parseDays('mon-fri')).toEqual([1, 2, 3, 4, 5]);
    expect(parseDays('sat,sun')).toEqual([0, 6]);
    expect(parseDays('0,1-2,2')).toEqual([0, 1, 2]);
    expect(() => parseDays('fri-mon')).toThrow(/backwards/);
    expect(() => parseDays('8')).toThrow(/not a day/);
  });

  it('hibernation: only the flags given; nothing = show', () => {
    expect(toHibernationInput({})).toBeNull();
    expect(
      toHibernationInput({
        enable: true,
        days: 'mon-fri',
        wake: '08:00',
        sleep: '20:00',
        timezone: 'Europe/Sofia',
      }),
    ).toEqual({
      enabled: true,
      days: [1, 2, 3, 4, 5],
      wakeAt: '08:00',
      sleepAt: '20:00',
      timezone: 'Europe/Sofia',
    });
    expect(() => toHibernationInput({ wake: '8:00' })).toThrow(/HH:MM/);
    expect(() => toHibernationInput({ enable: true, disable: true })).toThrow();
  });

  it('a lambda recommendation: a row and the lambforge.yaml lines', () => {
    const r = {
      lambdaId: 'l1',
      lambdaName: 'api',
      mode: 'fixed' as const,
      cpu: part(30, 230, 'raise'),
      memory: part(128, 128, 'keep'),
      monthlyCostNow: 1,
      monthlyCostRecommended: 2,
      currency: 'EUR',
      confident: true,
      hours: 48,
    };
    expect(recommendationRow(r)).toMatchObject({
      name: 'api',
      mode: 'fixed',
      cpu: '30 -> 230m (raise)',
      memory: '128 MB (keep)',
    });
    expect(yamlSnippet(r)).toContain('minCpu: 230');
  });

  it('a plugin apply keeps the limits, raising them only when needed', () => {
    const r = {
      pluginName: 'redis-plugin',
      cpu: part(50, 300, 'raise'),
      memory: part(64, 32, 'lower'),
      monthlyCostNow: 1,
      monthlyCostRecommended: 1,
      currency: 'EUR',
      confident: true,
      hours: 48,
    };
    expect(pluginResources(r, { maxCpu: 250, maxMemory: 256 })).toEqual({
      minCpu: 300,
      maxCpu: 300,
      minMemory: 32,
      maxMemory: 256,
    });
  });

  it('cluster:autoscale --no-replace-cheaper', () => {
    expect(toAutoscaleInput({ replaceCheaper: false })).toEqual({
      replaceCheaper: false,
    });
  });
});
