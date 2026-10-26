import { parseRunInput } from './definition';
import { WorkflowRun, WorkflowTrigger, WorkflowTriggerInput } from './types';

/* Feature workflows - triggers: pure helpers for workflow:trigger:*. A
 * trigger is an HTTP URL or a schedule that starts runs; Fission (1.26+)
 * creates the run itself. */

export interface TriggerAddOptions {
  http?: boolean;
  cron?: string;
  path?: string;
  method?: string;
  input?: string;
  inputText?: string;
}

/** --http [--path --method] or --cron <expr> [--input / --input-file]. */
export const buildTriggerInput = (
  cmd: TriggerAddOptions,
): WorkflowTriggerInput => {
  if (!!cmd.http === !!cmd.cron) {
    throw new Error('Pass either --http or --cron "<schedule>"');
  }
  if (cmd.http) {
    if (cmd.input || cmd.inputText) {
      throw new Error(
        'An HTTP trigger takes its input from the request body; --input is for --cron',
      );
    }
    const methods = (cmd.method ?? '')
      .split(',')
      .map((m) => m.trim().toUpperCase())
      .filter(Boolean);
    return {
      kind: 'http',
      ...(cmd.path ? { path: cmd.path.replace(/^\/+/, '') } : {}),
      ...(methods.length ? { methods } : {}),
    };
  }
  return {
    kind: 'cron',
    cron: cmd.cron.trim(),
    input: parseRunInput(cmd.inputText ?? cmd.input),
  };
};

/** A trigger by id, Fission name, HTTP path or schedule. */
export const findTrigger = (
  triggers: WorkflowTrigger[] | null | undefined,
  key?: string,
) => {
  if (!key) {
    throw new Error(
      '--trigger is required (an id or path from workflow:trigger:list)',
    );
  }
  const k = key.replace(/^\/+/, '');
  const hit = (triggers ?? []).find(
    (t) =>
      t.id === key || t.resourceName === key || t.path === k || t.cron === key,
  );
  if (!hit) {
    throw new Error(
      `No trigger "${key}" on this workflow (see workflow:trigger:list)`,
    );
  }
  return hit;
};

/** One table row of workflow:trigger:list. */
export const triggerRow = (t: WorkflowTrigger) => ({
  id: t.id,
  kind: t.kind,
  when:
    t.kind === 'http'
      ? `${(t.methods ?? ['POST']).filter(Boolean).join(',')} ${t.url ?? `/workflows/${t.path}`}`
      : (t.cron ?? ''),
  input: t.kind === 'cron' ? JSON.stringify(t.input ?? {}) : 'request body',
});

/** How a run started, for workflow:runs. */
export const runSource = (run: WorkflowRun) =>
  run.triggerKind === 'httptrigger'
    ? 'http'
    : run.triggerKind === 'timetrigger'
      ? 'schedule'
      : 'manual';
