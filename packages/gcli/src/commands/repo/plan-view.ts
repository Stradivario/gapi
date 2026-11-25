import { paint, ui } from '~/services/ui';

import { unitKey } from './discover';
import { show } from './drift';
import type { SectionPlan, UnitPlan } from './plan';

/** How each state of a section reads (feature repo-plan, cli-output). */
const STATE: Record<
  SectionPlan['state'],
  { mark: string; style: ('green' | 'yellow' | 'red' | 'dim')[]; text: string }
> = {
  'in-sync': { mark: '✔', style: ['green'], text: 'in sync' },
  changes: { mark: '~', style: ['yellow'], text: 'will change' },
  missing: { mark: '+', style: ['green'], text: 'will be created' },
  error: { mark: '✖', style: ['red'], text: 'error' },
};

export interface PlanCounts {
  inSync: number;
  drift: number;
  errors: number;
}

export const countPlan = (plans: UnitPlan[]): PlanCounts => {
  const all = plans.flatMap((p) => p.sections);
  const errors = all.filter((s) => s.state === 'error').length;
  const drift = all.filter(
    (s) => s.state === 'changes' || s.state === 'missing',
  ).length;
  return { inSync: all.length - drift - errors, drift, errors };
};

const unitInSync = (p: UnitPlan) =>
  p.sections.every((s) => s.state === 'in-sync');

const nameOf = (p: UnitPlan, names: Map<string, string>) =>
  names.get(p.unit) ?? p.unit;

/** lambda name per unit folder ('(root)' for a file at the root) */
export const unitNames = (
  units: {
    id: string;
    variant?: string;
    spec: { function?: { name?: string } };
  }[],
) =>
  new Map(
    units.map((u) => [
      unitKey(u),
      u.spec.function?.name ?? (u.id === '.' ? '(root)' : u.id),
    ]),
  );

/**
 * The plan, compact: every unit with something to do gets its sections
 * (field: now -> wanted under a change); the units fully in sync are one
 * line; then the project's unmanaged lambdas.
 */
export function renderPlan(
  plans: UnitPlan[],
  unmanaged: string[],
  names: Map<string, string> = new Map(),
) {
  const active = plans.filter((p) => p.sections.length && !unitInSync(p));
  const quiet = plans.filter((p) => p.sections.length && unitInSync(p));
  const width = Math.max(
    0,
    ...active.flatMap((p) => p.sections.map((s) => s.section.length)),
  );

  for (const p of active) {
    ui.print(
      `${ui.bold(nameOf(p, names))}  ${ui.dim(p.unit === '.' ? '(root)' : p.unit)}`,
    );
    for (const s of p.sections) {
      const st = STATE[s.state];
      ui.print(
        `  ${paint(st.mark, [...st.style, 'bold'])} ${s.section.padEnd(width)}  ${ui.dim(st.text)}`,
      );
      for (const c of s.changes) {
        ui.print(
          `      ${ui.dim(`${c.field}:`)} ${show(c.now)} ${ui.dim('->')} ${show(c.wanted)}`,
        );
      }
      if (s.note) ui.print(`      ${paint(s.note, ['red'])}`);
    }
    ui.print('');
  }

  if (quiet.length) {
    ui.print(
      `${paint('✔', ['green', 'bold'])} ${quiet.length} in sync ${ui.dim(quiet.map((p) => nameOf(p, names)).join(', '))}`,
    );
  }
  if (unmanaged.length) {
    ui.print(
      `${ui.dim('·')} ${unmanaged.length} not in any lambforge.yaml here, left alone ${ui.dim(unmanaged.join(', '))}`,
    );
  }
}
