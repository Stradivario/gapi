import { toAutoscaleInput } from '../src/commands/cluster/autoscale';
import {
  parseDays,
  pluginResources,
  recommendationRow,
  sleepScheduleRow,
  toSleepScheduleInput,
  yamlSnippet,
} from '../src/commands/cost/parse';
import { sleepScheduleOption } from '../src/commands/lambda/helpers/sleep-schedule';

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

  it('sleep-schedule:set: the name plus only the flags given', () => {
    expect(toSleepScheduleInput('working-hours', {})).toEqual({
      name: 'working-hours',
    });
    expect(
      toSleepScheduleInput(' office ', {
        resume: true,
        days: 'mon-fri',
        wake: '08:00',
        sleep: '20:00',
        timezone: ' Europe/Sofia ',
      }),
    ).toEqual({
      name: 'office',
      enabled: true,
      days: [1, 2, 3, 4, 5],
      wakeAt: '08:00',
      sleepAt: '20:00',
      timezone: 'Europe/Sofia',
    });
    expect(toSleepScheduleInput('a', { pause: true })).toEqual({
      name: 'a',
      enabled: false,
    });
    expect(() => toSleepScheduleInput('a', { wake: '8:00' })).toThrow(/HH:MM/);
    expect(() =>
      toSleepScheduleInput('a', { pause: true, resume: true }),
    ).toThrow(/not both/);
  });

  it('sleep-schedule names: lowercase, digits and dashes, 1-40 characters', () => {
    for (const ok of ['a', 'working-hours', '9to5', 'a'.repeat(40)]) {
      expect(toSleepScheduleInput(ok, {}).name).toBe(ok);
    }
    for (const bad of ['', 'Working', '-a', 'a-', 'a_b', 'a'.repeat(41)]) {
      expect(() => toSleepScheduleInput(bad, {})).toThrow(/schedule name/);
    }
  });

  it('sleep-schedule:list row: hours, days, paused, state, lambdas', () => {
    expect(
      sleepScheduleRow({
        name: 'working-hours',
        enabled: false,
        timezone: 'Europe/Sofia',
        days: [1, 2, 3, 4, 5],
        wakeAt: '08:00',
        sleepAt: '20:00',
        lambdas: ['api', 'worker'],
        state: 'asleep',
        override: 'sleep',
        overrideUntil: '2026-11-30T08:00:00Z',
      }),
    ).toEqual({
      name: 'working-hours',
      hours: '08:00-20:00',
      days: 'mon,tue,wed,thu,fri',
      timezone: 'Europe/Sofia',
      paused: 'yes',
      state: 'asleep (sleep until 2026-11-30T08:00:00Z)',
      lambdas: 'api, worker',
      error: '',
    });
    expect(sleepScheduleRow({ name: 'x', state: 'awake' })).toMatchObject({
      paused: '',
      state: 'awake',
      lambdas: '',
    });
  });

  it('scaleOptions.sleepSchedule: flag over spec, only sent when set', () => {
    expect(sleepScheduleOption({}, {})).toEqual({});
    expect(sleepScheduleOption({}, undefined)).toEqual({});
    expect(sleepScheduleOption({}, { sleepSchedule: null })).toEqual({});
    expect(sleepScheduleOption({}, { sleepSchedule: 'working-hours' })).toEqual(
      { sleepSchedule: 'working-hours' },
    );
    expect(
      sleepScheduleOption(
        { sleepSchedule: 'nights' },
        { sleepSchedule: 'working-hours' },
      ),
    ).toEqual({ sleepSchedule: 'nights' });
    // '' = always on, sent so a deploy clears it
    expect(
      sleepScheduleOption({ sleepSchedule: '' }, { sleepSchedule: 'x' }),
    ).toEqual({ sleepSchedule: '' });
    expect(() =>
      sleepScheduleOption({}, { sleepSchedule: 'Working Hours' }),
    ).toThrow(/scaleOptions.sleepSchedule/);
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
