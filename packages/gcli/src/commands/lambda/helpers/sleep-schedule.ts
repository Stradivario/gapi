import { checkScheduleName } from '~/commands/cost/parse';

/** `scaleOptions.sleepSchedule` to send - the project's sleep schedule the
    lambda follows (flag wins over the spec). Only sent when set, so gcli
    still works against an API without the field; '' sends '' = always on. */
export function sleepScheduleOption(
  cmd: { sleepSchedule?: string },
  spec?: { sleepSchedule?: string | null },
): { sleepSchedule?: string } {
  const value = cmd.sleepSchedule ?? spec?.sleepSchedule;
  if (value == null) return {};
  const name = String(value).trim();
  if (name === '') return { sleepSchedule: '' };
  return {
    sleepSchedule: checkScheduleName(name, 'scaleOptions.sleepSchedule'),
  };
}
