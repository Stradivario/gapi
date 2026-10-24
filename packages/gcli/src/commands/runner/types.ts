export interface LocalRunnerModel {
  name: string;
  parameterSize?: string;
  quantization?: string;
  family?: string;
  capabilities: string[];
  contextLength?: number;
  // The context window the model is loaded with right now (`/api/ps`);
  // undefined when it isn't loaded.
  runtimeContextLength?: number;
}

export interface LocalRunner {
  id: string;
  name: string;
  tokenPrefix?: string;
  online?: boolean;
  lastSeenAt?: string;
  runnerVersion?: string;
  models?: LocalRunnerModel[];
  // null/undefined = every model is shown in the chat picker
  enabledModels?: string[] | null;
  createdAt?: string;
}

/** What the backend sends through `subscribeToRunnerRequests`. */
export interface RunnerRequest {
  requestId: string;
  // 'approval': a local workspace's command approval was answered in the
  // web UI (requestId = approval id, body = { decision }).
  type: 'request' | 'cancel' | 'approval';
  method?: string;
  path?: string;
  body?: string;
}

/** What the runner sends back with `runnerRespond` (see LocalRunnerTunnelService). */
export interface RunnerResponseFrame {
  requestId: string;
  seq: number;
  type: 'ack' | 'head' | 'chunk' | 'end' | 'error' | 'ping';
  status?: number;
  data?: string;
  error?: string;
}

export interface SavedRunner {
  id: string;
  name: string;
  token: string;
  wsUrl?: string;
}
