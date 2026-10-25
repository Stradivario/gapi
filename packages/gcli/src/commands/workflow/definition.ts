import { dump, load } from 'js-yaml';

import { WorkflowDefinition, WorkflowRun, WorkflowRunEvent } from './types';

/* Feature workflows: pure helpers for the workflow:* commands - reading a
 * workflow file, writing one, parsing run input and rendering a run. */

/** What a workflow file carries (all optional except the definition). */
export interface WorkflowFile {
  name?: string;
  description?: string;
  clusterId?: string;
  definition: WorkflowDefinition;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

/**
 * Accepts, in JSON or YAML:
 *  - `workflow: {name, description, clusterId, definition}` (what
 *    workflow:get / workflow:generate write),
 *  - the same object without the `workflow:` key,
 *  - a Fission manifest (`kind: Workflow`, `metadata.name`, `spec`),
 *  - a bare definition (`startAt` + `states`).
 */
export const parseWorkflowFile = (text: string): WorkflowFile => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    raw = load(text);
  }
  if (!isObject(raw)) {
    throw new Error('The workflow file must be a YAML or JSON object');
  }
  const doc = isObject(raw.workflow) ? raw.workflow : raw;
  if (doc.kind === 'Workflow' && isObject(doc.spec)) {
    const metadata = isObject(doc.metadata) ? doc.metadata : {};
    return {
      name: typeof metadata.name === 'string' ? metadata.name : undefined,
      definition: doc.spec as WorkflowDefinition,
    };
  }
  if (isObject(doc.definition)) {
    return {
      name: typeof doc.name === 'string' ? doc.name : undefined,
      description:
        typeof doc.description === 'string' ? doc.description : undefined,
      clusterId: typeof doc.clusterId === 'string' ? doc.clusterId : undefined,
      definition: doc.definition as WorkflowDefinition,
    };
  }
  if (isObject(doc.states)) {
    return { definition: doc as WorkflowDefinition };
  }
  throw new Error(
    'No workflow definition found: expected `workflow.definition`, `definition`, a `kind: Workflow` manifest or `startAt` + `states`',
  );
};

/** The file workflow:get / workflow:generate write (workflow:apply reads it). */
export const toWorkflowYaml = (file: WorkflowFile) =>
  dump(
    {
      workflow: {
        ...(file.name ? { name: file.name } : {}),
        ...(file.description ? { description: file.description } : {}),
        ...(file.clusterId ? { clusterId: file.clusterId } : {}),
        definition: file.definition,
      },
    },
    { noRefs: true, lineWidth: 100 },
  );

/** --input '{"a":1}' / --input-file path content; empty = {}. */
export const parseRunInput = (text?: string): unknown => {
  if (!text?.trim()) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`The run input is not valid JSON: ${(e as Error).message}`);
  }
};

export const TERMINAL_PHASES = ['Succeeded', 'Failed', 'Cancelled', 'TimedOut'];

export const isTerminal = (phase?: string | null) =>
  TERMINAL_PHASES.includes(phase ?? '');

/** The lambdas a definition calls, in walk order (for list output). */
export const taskLambdas = (definition?: WorkflowDefinition): string[] => {
  const out: string[] = [];
  const walk = (d?: WorkflowDefinition) =>
    Object.values(d?.states ?? {}).forEach((s) => {
      if (s?.type === 'Task' && s.function?.name) out.push(s.function.name);
      (s?.branches ?? []).forEach(walk);
    });
  walk(definition);
  return [...new Set(out)];
};

const EVENT_TEXT: Record<string, string> = {
  RunStarted: 'run started',
  StepScheduled: 'started',
  StepSucceeded: 'succeeded',
  StepFailed: 'failed',
  TimerFired: 'retrying after backoff',
  RunSucceeded: 'run succeeded',
  RunFailed: 'run failed',
  RunCancelled: 'run cancelled',
  RunTimedOut: 'run timed out',
  BranchesJoined: 'branches joined',
};

/** One readable line per run event ("charge  started (attempt 2)"). */
export const formatEvent = (e: WorkflowRunEvent) => {
  const what = EVENT_TEXT[e.type] ?? e.type;
  const attempt = e.attempt && e.attempt > 1 ? ` (attempt ${e.attempt})` : '';
  const time = e.at ? new Date(e.at).toLocaleTimeString() : '';
  return `${time.padEnd(11)} ${e.state ? `${e.state}  ` : ''}${what}${attempt}`;
};

/** Events not printed yet (by seq), for --follow / --wait. */
export const newEvents = (run: WorkflowRun, printedSeq: number) =>
  (run.events ?? [])
    .filter((e) => e.seq > printedSeq)
    .sort((a, b) => a.seq - b.seq);
