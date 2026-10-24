/**
 * Which commands the chat may run on this machine without asking.
 *
 * The allow-list is a convenience, not a sandbox: an allowed `npm test` runs
 * whatever the project's test script does. What it guarantees is that
 * nothing outside it runs without the user's OK, and that a few commands
 * that destroy work or leave the machine always ask (unless --yolo).
 */

export type PolicyMode = 'ask' | 'yolo';

// Read-only inspection the agents need constantly.
export const DEFAULT_ALLOW = [
  'git status*',
  'git diff*',
  'git log*',
  'git show*',
  'git branch',
  'git rev-parse*',
  'ls*',
  'pwd',
  'node --version',
  'npm --version',
  'npm ls*',
  'which *',
];

// Always asked, even when an allow rule (or "always") matches.
const ALWAYS_ASK: RegExp[] = [
  /\bsudo\b/,
  /\bsu\s/,
  /\brm\s+(-\w*\s+)*-\w*[rR]\w*/,
  /\bgit\s+(push|reset\s+--hard|clean|rebase|filter-branch|branch\s+-D|checkout\s+--\s|restore\s)/,
  /\bgit\s+commit\b/,
  /\b(mkfs|fdisk|diskutil|format)\b/,
  /\bdd\s+if=/,
  /\b(curl|wget)\b[^|]*\|\s*(ba|z)?sh\b/,
  /\bchmod\s+-R\b|\bchown\b/,
  /\b(shutdown|reboot|halt)\b/,
  /\bnpm\s+(publish|unpublish)\b|\byarn\s+publish\b/,
  /\bkill(all)?\b/,
];

/** Shell metacharacters that can hide another command inside a segment. */
const HIDDEN_COMMAND = /\$\(|`|<\(|>\(/;

/** The command's simple commands (split on ; && || | and newlines). */
export const segmentsOf = (command: string) =>
  command
    .split(/&&|\|\||;|\||\n/)
    .map((s) => s.trim())
    .filter(Boolean);

const ruleToRegExp = (rule: string) =>
  new RegExp(
    `^${rule
      .trim()
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')}$`,
  );

const normalize = (segment: string) =>
  segment
    // leading VAR=value assignments do not change which program runs
    .replace(/^(\w+=\S*\s+)+/, '')
    .replace(/\s+/g, ' ');

/** "npm install lodash" -> "npm install*" (what "always" remembers). */
export const alwaysRuleFor = (segment: string) => {
  const words = normalize(segment).split(' ');
  const second = words[1];
  return second && /^[a-z][\w:-]*$/i.test(second)
    ? `${words[0]} ${second}*`
    : `${words[0]}*`;
};

export type PolicyVerdict =
  | { decision: 'allow'; reason: string }
  | { decision: 'ask'; reason: string };

export class CommandPolicy {
  private rules: { rule: string; re: RegExp }[] = [];

  constructor(
    readonly mode: PolicyMode,
    allow: string[] = [],
    useDefaults = true,
  ) {
    for (const rule of [...(useDefaults ? DEFAULT_ALLOW : []), ...allow]) {
      this.add(rule);
    }
  }

  get allowRules() {
    return this.rules.map((r) => r.rule);
  }

  add(rule: string) {
    const trimmed = rule.trim();
    if (trimmed && !this.rules.some((r) => r.rule === trimmed)) {
      this.rules.push({ rule: trimmed, re: ruleToRegExp(trimmed) });
    }
  }

  check(command: string): PolicyVerdict {
    if (this.mode === 'yolo') {
      return { decision: 'allow', reason: '--yolo' };
    }
    const dangerous = ALWAYS_ASK.find((re) => re.test(command));
    if (dangerous) {
      return { decision: 'ask', reason: 'always asked (can destroy work)' };
    }
    if (HIDDEN_COMMAND.test(command)) {
      return { decision: 'ask', reason: 'contains a command substitution' };
    }
    const segments = segmentsOf(command);
    const unmatched = segments.filter(
      (s) => !this.rules.some((r) => r.re.test(normalize(s))),
    );
    if (segments.length && !unmatched.length) {
      return { decision: 'allow', reason: 'allow-list' };
    }
    return {
      decision: 'ask',
      reason: `not in the allow-list: ${unmatched[0]}`,
    };
  }

  /** "Always" for this session: remember each segment's program + verb. */
  remember(command: string) {
    if (ALWAYS_ASK.some((re) => re.test(command))) return;
    for (const segment of segmentsOf(command)) {
      this.add(alwaysRuleFor(segment));
    }
  }
}
