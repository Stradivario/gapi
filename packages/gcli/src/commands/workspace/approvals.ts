import { createInterface } from 'readline';

import { CommandPolicy } from './policy';

export type Decision = 'allow' | 'always' | 'deny';

export const APPROVAL_TIMEOUT_MS = 5 * 60_000;

export interface ApprovalBackend {
  /** Creates the web card; resolves its id (null when it could not be made). */
  request(input: {
    command: string;
    cwd: string;
    chatId?: string;
  }): Promise<string | null>;
  /** Tells the backend how a pending approval ended (closes the web card). */
  settle(approvalId: string, decision: Decision | 'expired'): Promise<void>;
}

export interface ApprovalPrompt {
  /** Asks in the terminal; resolves null when aborted. */
  ask(question: string, signal: AbortSignal): Promise<Decision | null>;
}

/** y / a / n on gcli's own terminal (only one question at a time). */
export class TerminalPrompt implements ApprovalPrompt {
  private queue: Promise<unknown> = Promise.resolve();

  ask(question: string, signal: AbortSignal): Promise<Decision | null> {
    const asked = this.queue.then(() => this.askNow(question, signal));
    this.queue = asked.catch(() => undefined);
    return asked;
  }

  private askNow(question: string, signal: AbortSignal) {
    if (signal.aborted) return Promise.resolve(null);
    return new Promise<Decision | null>((resolve) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const done = (value: Decision | null) => {
        signal.removeEventListener('abort', onAbort);
        rl.close();
        resolve(value);
      };
      const onAbort = () => {
        process.stdout.write('\n  (answered elsewhere)\n');
        done(null);
      };
      signal.addEventListener('abort', onAbort, { once: true });
      rl.question(question, (answer) => {
        const a = answer.trim().toLowerCase();
        done(
          a === 'y' || a === 'yes'
            ? 'allow'
            : a === 'a' || a === 'always'
              ? 'always'
              : 'deny',
        );
      });
    });
  }
}

export interface ApprovalOutcome {
  approved: boolean;
  decision: Decision | 'expired' | 'cancelled' | 'policy';
  by: 'policy' | 'terminal' | 'web' | 'timeout' | 'chat-stopped';
}

/**
 * Decides whether a command may run: the policy first, then the user - in
 * gcli's terminal (when it has one) AND on the chat's approval card. The
 * first answer wins; the other side is closed.
 */
export class ApprovalGate {
  private waiting = new Map<string, (decision: Decision) => void>();
  // A web answer that arrived before the card's id was back here.
  private early = new Map<string, Decision>();

  constructor(
    private policy: CommandPolicy,
    private backend: ApprovalBackend,
    private prompt: ApprovalPrompt | null,
    private log: (line: string) => void,
    private timeoutMs = APPROVAL_TIMEOUT_MS,
  ) {}

  /** The web answered (an 'approval' frame from the tunnel). */
  onWebDecision(approvalId: string, decision: Decision) {
    const waiter = this.waiting.get(approvalId);
    if (waiter) waiter(decision);
    else this.early.set(approvalId, decision);
  }

  async approve(input: {
    command: string;
    cwd: string;
    chatId?: string;
    signal?: AbortSignal;
  }): Promise<ApprovalOutcome> {
    if (input.signal?.aborted) {
      return { approved: false, decision: 'cancelled', by: 'chat-stopped' };
    }
    const verdict = this.policy.check(input.command);
    if (verdict.decision === 'allow') {
      return { approved: true, decision: 'policy', by: 'policy' };
    }
    this.log(
      `? approval needed (${verdict.reason}): ${input.command}${input.cwd !== '.' ? `  [in ${input.cwd}]` : ''}`,
    );

    const approvalId = await this.backend
      .request({
        command: input.command,
        cwd: input.cwd,
        chatId: input.chatId,
      })
      .catch(() => null);
    if (!approvalId && !this.prompt) {
      return { approved: false, decision: 'expired', by: 'timeout' };
    }

    const settle = new AbortController();
    const outcome = await new Promise<ApprovalOutcome>((resolve) => {
      const finish = (o: ApprovalOutcome) => {
        clearTimeout(timer);
        input.signal?.removeEventListener('abort', onStopped);
        if (approvalId) this.waiting.delete(approvalId);
        settle.abort();
        resolve(o);
      };
      const fromDecision = (
        decision: Decision,
        by: 'terminal' | 'web',
      ): ApprovalOutcome => ({
        approved: decision !== 'deny',
        decision,
        by,
      });
      const timer = setTimeout(
        () => finish({ approved: false, decision: 'expired', by: 'timeout' }),
        this.timeoutMs,
      );
      const onStopped = () =>
        finish({ approved: false, decision: 'cancelled', by: 'chat-stopped' });
      input.signal?.addEventListener('abort', onStopped, { once: true });
      if (approvalId) {
        this.waiting.set(approvalId, (d) => finish(fromDecision(d, 'web')));
        const early = this.early.get(approvalId);
        if (early) {
          this.early.delete(approvalId);
          finish(fromDecision(early, 'web'));
          return;
        }
      }
      void this.prompt
        ?.ask(
          `  Allow this command? [y]es / [a]lways for this session / [N]o: `,
          settle.signal,
        )
        .then((d) => d && finish(fromDecision(d, 'terminal')));
    });

    if (outcome.decision === 'always') {
      this.policy.remember(input.command);
    }
    if (approvalId && outcome.by !== 'web') {
      const decision =
        outcome.decision === 'allow' ||
        outcome.decision === 'always' ||
        outcome.decision === 'deny'
          ? outcome.decision
          : 'expired';
      await this.backend.settle(approvalId, decision).catch(() => undefined);
    }
    this.log(
      outcome.approved
        ? `  approved (${outcome.by})`
        : `  not approved (${outcome.decision === 'deny' ? `denied in ${outcome.by}` : outcome.by})`,
    );
    return outcome;
  }
}
