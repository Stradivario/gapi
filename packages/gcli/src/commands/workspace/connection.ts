import { hostname } from 'os';

import {
  describeError,
  FrameSender,
  RunnerAuthError,
  RunnerLogger,
  SocketLike,
  TunnelConnection,
} from '../runner/tunnel';
import { RunnerRequest } from '../runner/types';
import {
  ApprovalBackend,
  ApprovalGate,
  ApprovalPrompt,
  Decision,
} from './approvals';
import { WorkspaceError, WorkspaceFiles } from './files';
import { CommandPolicy } from './policy';
import { buildEnv, EnvOptions, ProcessManager, runCommand } from './processes';

export const WORKSPACE_PATH_PREFIX = '/workspace/';

// The operations the backend may ask for (LocalWorkspaceService). Anything
// else is refused before it is even acknowledged.
export const WORKSPACE_OPS = [
  'info',
  'list',
  'read',
  'write',
  'edit',
  'delete',
  'search',
  'exec',
  'process/start',
  'process/list',
  'process/logs',
  'process/stop',
];

export interface LocalWorkspaceIdentity {
  id: string;
  name: string;
}

export interface WorkspaceConnectionOptions extends EnvOptions {
  wsUrl: string;
  token: string;
  root: string;
  version: string;
  logger: RunnerLogger;
  policy: CommandPolicy;
  allowSecrets?: boolean;
  /** null = no terminal (approvals only on the web card). */
  prompt: ApprovalPrompt | null;
  createSocket?: (url: string, protocol: string) => SocketLike;
  heartbeatMs?: number;
  flushMs?: number;
  pingMs?: number;
  operationTimeoutMs?: number;
  maxReconnectDelayMs?: number;
  approvalTimeoutMs?: number;
}

const HEARTBEAT_MUTATION = `mutation localWorkspaceHeartbeat($info: LocalWorkspaceHeartbeatInput) {
  localWorkspaceHeartbeat(info: $info) { id name }
}`;
const REQUEST_APPROVAL_MUTATION = `mutation requestLocalWorkspaceApproval($command: String!, $cwd: String, $chatId: String) {
  requestLocalWorkspaceApproval(command: $command, cwd: $cwd, chatId: $chatId) { id }
}`;
const SETTLE_APPROVAL_MUTATION = `mutation settleLocalWorkspaceApproval($approvalId: String!, $decision: String!) {
  settleLocalWorkspaceApproval(approvalId: $approvalId, decision: $decision) { status }
}`;

type Args = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
const num = (v: unknown) =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;
const short = (text: string, max = 100) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

/**
 * Serves a directory on this machine to the Lambforge chat agents: files
 * (confined to the root), commands (gated by the policy and the user's
 * approval) and background processes. Outbound WebSocket only, like the
 * local AI runner - works behind NAT, opens no port.
 */
export class WorkspaceConnection extends TunnelConnection<LocalWorkspaceIdentity> {
  readonly files: WorkspaceFiles;
  readonly processes: ProcessManager;
  readonly approvals: ApprovalGate;

  constructor(private options: WorkspaceConnectionOptions) {
    super(options);
    this.files = new WorkspaceFiles(options.root, {
      allowSecrets: options.allowSecrets,
    });
    // Report a started/stopped process right away, not on the next beat.
    this.processes = new ProcessManager(
      () => void this.heartbeat(false).catch(() => undefined),
    );
    const backend: ApprovalBackend = {
      request: async (input) => {
        const data = (await this.operation(
          REQUEST_APPROVAL_MUTATION,
          input,
        )) as {
          requestLocalWorkspaceApproval?: { id: string };
        };
        return data?.requestLocalWorkspaceApproval?.id ?? null;
      },
      settle: async (approvalId, decision) => {
        await this.operation(SETTLE_APPROVAL_MUTATION, {
          approvalId,
          decision,
        });
      },
    };
    this.approvals = new ApprovalGate(
      options.policy,
      backend,
      options.prompt,
      (line) => options.logger.info(line),
      options.approvalTimeoutMs,
    );
  }

  protected connectionParams() {
    return { workspaceToken: this.options.token };
  }

  protected authError(reason: string) {
    return new RunnerAuthError(
      `Lambforge refused this workspace (${reason}). It may have been deleted - register it again with \`gcli workspace:start --reset\`.`,
    );
  }

  protected onIdentified(workspace: LocalWorkspaceIdentity) {
    this.options.logger.log(
      `Connected as local workspace "${workspace.name}" (${workspace.id}). The chat agents can now work in ${this.options.root}`,
    );
  }

  protected async heartbeat(announce: boolean) {
    void announce;
    const data = (await this.operation(HEARTBEAT_MUTATION, {
      info: {
        root: this.options.root,
        hostname: hostname(),
        platform: process.platform,
        gitBranch: await this.files.gitBranch(),
        clientVersion: this.options.version,
        policy: {
          mode: this.options.policy.mode,
          allow: this.options.policy.allowRules,
        },
        processes: this.processes.list().map((p) => ({
          id: p.id,
          name: p.name,
          command: p.command,
          status: p.status,
          pid: p.pid,
          exitCode: p.exitCode,
          startedAt: p.startedAt,
        })),
      },
    })) as { localWorkspaceHeartbeat: LocalWorkspaceIdentity };
    return data?.localWorkspaceHeartbeat;
  }

  protected refuse(request: RunnerRequest) {
    const op = request.path?.startsWith(WORKSPACE_PATH_PREFIX)
      ? request.path.slice(WORKSPACE_PATH_PREFIX.length)
      : '';
    return request.method === 'POST' && WORKSPACE_OPS.includes(op)
      ? null
      : `${request.method} ${request.path} is not allowed by this workspace`;
  }

  protected onNotice(request: RunnerRequest) {
    if (request.type !== 'approval') return;
    try {
      const { decision } = JSON.parse(request.body ?? '{}') as {
        decision?: Decision;
      };
      if (
        decision === 'allow' ||
        decision === 'always' ||
        decision === 'deny'
      ) {
        this.approvals.onWebDecision(request.requestId, decision);
      }
    } catch {
      // malformed notice: ignore
    }
  }

  protected async serve(
    request: RunnerRequest,
    sender: FrameSender,
    signal: AbortSignal,
  ) {
    const op = request.path.slice(WORKSPACE_PATH_PREFIX.length);
    let args: Args = {};
    try {
      args = JSON.parse(request.body || '{}');
    } catch {
      sender.pushBody(400, 'application/json', '{"error":"invalid JSON body"}');
      return;
    }
    try {
      const result = await this.dispatch(op, args, signal);
      sender.pushBody(200, 'application/json', JSON.stringify(result));
    } catch (e) {
      if (signal.aborted) {
        this.options.logger.info(`x  ${op} cancelled`);
        return;
      }
      const status = e instanceof WorkspaceError ? e.status : 500;
      const message = describeError(e);
      this.options.logger.warn(`x  ${op}: ${message}`);
      sender.pushBody(
        status,
        'application/json',
        JSON.stringify({ error: message }),
      );
    }
  }

  /** One operation (exposed for tests). */
  async dispatch(op: string, args: Args, signal?: AbortSignal) {
    const log = (line: string) => this.options.logger.info(line);
    switch (op) {
      case 'info':
        return {
          root: this.options.root,
          gitBranch: await this.files.gitBranch(),
          policy: {
            mode: this.options.policy.mode,
            allow: this.options.policy.allowRules,
          },
          processes: this.processes.list(),
        };
      case 'list':
        log(`-> list ${str(args.path) ?? '.'}`);
        return this.files.list({
          path: str(args.path),
          recursive: args.recursive !== false,
          limit: num(args.limit),
        });
      case 'read':
        log(`-> read ${str(args.path)}`);
        return this.files.read({
          path: str(args.path),
          startLine: num(args.startLine),
          endLine: num(args.endLine),
        });
      case 'search':
        log(`-> search /${str(args.pattern)}/ in ${str(args.path) ?? '.'}`);
        return this.files.search({
          pattern: str(args.pattern),
          path: str(args.path),
          glob: str(args.glob),
          regex: args.regex !== false,
          caseSensitive: args.caseSensitive === true,
          maxResults: num(args.maxResults),
        });
      case 'write': {
        const result = await this.files.write({
          path: str(args.path),
          content: str(args.content) ?? '',
          expectedHash: str(args.expectedHash),
        });
        log(`✎  ${result.created ? 'created' : 'wrote'} ${result.path}`);
        return result;
      }
      case 'edit': {
        const result = await this.files.edit({
          path: str(args.path),
          oldText: str(args.oldText),
          newText: str(args.newText) ?? '',
          replaceAll: args.replaceAll === true,
          expectedHash: str(args.expectedHash),
        });
        log(`✎  edited ${result.path} (${result.replacements}x)`);
        return result;
      }
      case 'delete': {
        const result = await this.files.delete({ path: str(args.path) });
        if (result.deleted) log(`✎  deleted ${result.path}`);
        return result;
      }
      case 'exec':
        return this.exec(args, signal);
      case 'process/start':
        return this.startProcess(args, signal);
      case 'process/list':
        return { processes: this.processes.list() };
      case 'process/logs':
        return this.processes.logs({
          processId: str(args.processId),
          tail: num(args.tail),
          sinceLine: num(args.sinceLine),
        });
      case 'process/stop': {
        const result = await this.processes.stop({
          processId: str(args.processId),
        });
        log(`■  stopped ${result.processId}`);
        return result;
      }
      default:
        throw new WorkspaceError(`unknown operation ${op}`, 404);
    }
  }

  private async commandTarget(args: Args) {
    const command = str(args.command)?.trim();
    if (!command) throw new WorkspaceError('command is required');
    const { abs, rel } = await this.files.resolvePath(str(args.cwd));
    return { command, cwd: abs, displayCwd: rel };
  }

  private async gate(
    command: string,
    displayCwd: string,
    args: Args,
    signal?: AbortSignal,
  ) {
    const outcome = await this.approvals.approve({
      command,
      cwd: displayCwd,
      chatId: str(args.chatId),
      signal,
    });
    if (!outcome.approved) {
      throw new WorkspaceError(
        outcome.decision === 'deny'
          ? `The user denied this command: ${command}. Do not retry it - continue without it or report what you needed it for.`
          : outcome.by === 'timeout'
            ? `Nobody approved this command within 5 minutes: ${command}. Do not retry it - report that it needs the user's approval.`
            : `Command not run: ${command} (the chat was stopped).`,
        403,
      );
    }
  }

  private async exec(args: Args, signal?: AbortSignal) {
    const { command, cwd, displayCwd } = await this.commandTarget(args);
    await this.gate(command, displayCwd, args, signal);
    this.options.logger.info(`$  ${short(command, 200)}`);
    const result = await runCommand({
      command,
      cwd,
      displayCwd,
      timeoutSeconds: num(args.timeoutSeconds),
      env: buildEnv(this.options, { CI: '1' }),
      signal,
    });
    this.options.logger.info(
      `   exit ${result.exitCode ?? result.signal}${result.timedOut ? ' (timed out)' : ''} in ${(result.durationMs / 1000).toFixed(1)}s`,
    );
    return result;
  }

  private async startProcess(args: Args, signal?: AbortSignal) {
    const { command, cwd, displayCwd } = await this.commandTarget(args);
    await this.gate(command, displayCwd, args, signal);
    this.options.logger.info(`▶  ${short(command, 200)}`);
    const result = await this.processes.start({
      command,
      cwd,
      displayCwd,
      name: str(args.name),
      waitFor: str(args.waitFor),
      waitSeconds: num(args.waitSeconds),
      env: buildEnv(this.options),
      signal,
    });
    this.options.logger.info(
      `   ${result.processId} ${result.status}${result.matched === false ? ' (waitFor not seen yet)' : ''}`,
    );
    return result;
  }

  stop() {
    this.processes.stopAll();
    super.stop();
  }
}
