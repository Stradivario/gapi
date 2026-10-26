/* Feature workflows: the API shapes (graphql-server-lambdas workflows +
 * graphql-server generateWorkflowDraft). Local interfaces, as the gcli
 * introspection does not carry them yet. */

export interface WorkflowDefinition {
  startAt?: string;
  states?: Record<string, WorkflowState>;
  [key: string]: unknown;
}

export interface WorkflowState {
  type?: string;
  function?: { type?: string; name?: string };
  next?: string;
  end?: boolean;
  branches?: WorkflowDefinition[];
  [key: string]: unknown;
}

/** An HTTP or cron trigger that starts runs (Fission creates the run). */
export interface WorkflowTrigger {
  id: string;
  kind: 'http' | 'cron' | string;
  /** The Fission HTTPTrigger / TimeTrigger name. */
  resourceName?: string | null;
  path?: string | null;
  methods?: (string | null)[] | null;
  cron?: string | null;
  input?: unknown;
  /** http: the public URL (a request starts a run, answers 202 {run}). */
  url?: string | null;
  createdAt?: string | null;
}

export interface WorkflowTriggerInput {
  kind: 'http' | 'cron';
  path?: string;
  methods?: string[];
  cron?: string;
  input?: unknown;
}

export interface Workflow {
  id: string;
  projectId: string;
  clusterId?: string | null;
  name: string;
  description?: string | null;
  definition: WorkflowDefinition;
  triggers?: WorkflowTrigger[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowRunEvent {
  seq: number;
  at?: string | null;
  type: string;
  state?: string | null;
  attempt?: number | null;
}

export interface WorkflowRun {
  name: string;
  workflow?: string;
  phase?: string | null;
  input?: unknown;
  output?: unknown;
  startedAt?: string | null;
  finishedAt?: string | null;
  activeStates?: string[] | null;
  errorType?: string | null;
  cause?: string | null;
  /** httptrigger / timetrigger when a workflow trigger started the run. */
  triggerKind?: string | null;
  triggerName?: string | null;
  events?: WorkflowRunEvent[] | null;
}

export interface WorkflowValidation {
  valid: boolean;
  clusterId?: string | null;
  functions?: string[] | null;
}

export interface WorkflowDraft {
  definition: WorkflowDefinition;
  explanation?: string | null;
  warnings?: (string | null)[] | null;
}
