/** Plan 50 - pure option parsing and row shaping for the cost commands. */
import type {
  HibernationInput,
  LambdaRecommendation,
  PluginRecommendation,
  ProjectHibernation,
} from '~/services/cost-optimization';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** "1-5", "mon-fri", "0,6", "sat,sun" -> [1,2,3,4,5] */
export function parseDays(value: string): number[] {
  const one = (v: string) => {
    const t = v.trim().toLowerCase().slice(0, 3);
    const n = DAY_NAMES.includes(t) ? DAY_NAMES.indexOf(t) : Number(t);
    if (!Number.isInteger(n) || n < 0 || n > 6) {
      throw new Error(
        `--days: "${v}" is not a day (0-6, 0 = Sunday, or mon..sun)`,
      );
    }
    return n;
  };
  const days = value
    .split(',')
    .filter((p) => p.trim())
    .flatMap((part) => {
      const [a, b] = part.split('-');
      if (b === undefined) return [one(a)];
      const from = one(a);
      const to = one(b);
      if (to < from) throw new Error(`--days: "${part}" runs backwards`);
      return Array.from({ length: to - from + 1 }, (_, i) => from + i);
    });
  if (!days.length) throw new Error('--days: at least one day');
  return [...new Set(days)].sort((a, b) => a - b);
}

export interface HibernationOptions {
  enable?: boolean;
  disable?: boolean;
  timezone?: string;
  days?: string;
  wake?: string;
  sleep?: string;
}

/** Only the flags given; null = nothing to change (show it). */
export function toHibernationInput(
  cmd: HibernationOptions,
): HibernationInput | null {
  if (cmd.enable && cmd.disable) {
    throw new Error('Pass --enable or --disable, not both');
  }
  const input: HibernationInput = {};
  if (cmd.enable) input.enabled = true;
  if (cmd.disable) input.enabled = false;
  if (cmd.timezone !== undefined) input.timezone = cmd.timezone.trim();
  if (cmd.days !== undefined) input.days = parseDays(cmd.days);
  for (const [flag, field] of [
    ['wake', 'wakeAt'],
    ['sleep', 'sleepAt'],
  ] as const) {
    const v = cmd[flag];
    if (v === undefined) continue;
    if (!HHMM.test(v)) throw new Error(`--${flag} must be HH:MM, got "${v}"`);
    input[field] = v;
  }
  return Object.keys(input).length ? input : null;
}

export const hibernationRow = (h: ProjectHibernation) => ({
  enabled: h.enabled,
  state: h.state,
  hours: `${h.wakeAt}-${h.sleepAt}`,
  days: (h.days ?? []).map((d) => DAY_NAMES[d]).join(','),
  timezone: h.timezone,
  override: h.override ? `${h.override} until ${h.overrideUntil ?? '?'}` : '',
  lambdasAsleep: h.lambdasAsleep ?? 0,
  error: h.error ?? '',
});

const change = (
  p: { current: number; recommended: number; action: string },
  unit: string,
) =>
  p.action === 'keep'
    ? `${p.current}${unit} (keep)`
    : `${p.current} -> ${p.recommended}${unit} (${p.action})`;

export const recommendationRow = (
  r: LambdaRecommendation | PluginRecommendation,
) => ({
  name: 'lambdaName' in r ? r.lambdaName : r.pluginName,
  ...('mode' in r ? { mode: r.mode ?? 'fixed' } : {}),
  cpu: change(r.cpu, 'm'),
  memory: change(r.memory, ' MB'),
  use: `cpu ${r.cpu.typical}/${r.cpu.peak}m, mem ${r.memory.typical}/${r.memory.peak} MB`,
  monthly: `${r.monthlyCostNow} -> ${r.monthlyCostRecommended} ${r.currency}`,
  data: r.confident ? `${r.hours} h` : `${r.hours} h (under a day)`,
  note: [r.cpu.note, r.memory.note].filter(Boolean).join('; '),
});

/** The lambforge.yaml lines that apply a lambda recommendation. */
export const yamlSnippet = (r: LambdaRecommendation) =>
  `# ${r.lambdaName} (lambforge.yaml)\nscaleOptions:\n  minCpu: ${r.cpu.recommended}\n  minMemory: ${r.memory.recommended}`;

/** A plugin's new resources: the recommended reservation, limits kept
    (raised when the reservation would pass them). */
export const pluginResources = (
  r: PluginRecommendation,
  current: { maxCpu?: number | null; maxMemory?: number | null } | null,
) => ({
  minCpu: r.cpu.recommended,
  maxCpu: Math.max(Number(current?.maxCpu) || 0, r.cpu.recommended),
  minMemory: r.memory.recommended,
  maxMemory: Math.max(Number(current?.maxMemory) || 0, r.memory.recommended),
});
