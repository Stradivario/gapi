import { spawn } from 'child_process';
import { hostname, platform } from 'os';

import { Logger } from '~/services/log';

/*
 * `gcli login` without --token (feature cli-browser-login): ask the API for a
 * one-time login, print the link + code, open the browser, and wait until
 * the user approves it on lambforge.com. The server mints and encrypts the
 * token; this side only holds a random session id and receives the token
 * once. No dependencies: Node's built-in fetch (Node >= 22) and
 * child_process.
 */

export interface BrowserLoginResult {
  token: string;
  key: string;
}

export interface StartResponse {
  sessionId: string;
  userCode: string;
  verificationUrl: string;
  expiresAt?: string | null;
  pollIntervalSeconds?: number | null;
}

interface PollResponse {
  status: 'pending' | 'approved' | 'denied' | 'expired';
  token?: string | null;
  key?: string | null;
}

/** Unauthenticated call to the gateway (the CLI has no token yet). */
const anonymous = async <T>(
  url: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join('; '));
  }
  if (!body.data) {
    throw new Error(`${url} answered ${res.status} without data`);
  }
  return body.data;
};

export const startBrowserLogin = (url: string) =>
  anonymous<{ startCliLogin: StartResponse }>(
    url,
    `mutation startCliLogin($hostname: String, $platform: String, $apiUrl: String) {
      startCliLogin(hostname: $hostname, platform: $platform, apiUrl: $apiUrl) {
        sessionId userCode verificationUrl expiresAt pollIntervalSeconds
      }
    }`,
    { hostname: hostname(), platform: platform(), apiUrl: url },
  ).then((d) => d.startCliLogin);

export const pollBrowserLogin = (url: string, sessionId: string) =>
  anonymous<{ pollCliLogin: PollResponse }>(
    url,
    `mutation pollCliLogin($sessionId: String!) {
      pollCliLogin(sessionId: $sessionId) { status token key }
    }`,
    { sessionId },
  ).then((d) => d.pollCliLogin);

/** Best-effort: the link is printed anyway, so a headless box still works. */
export const openInBrowser = (link: string): void => {
  const [cmd, args] =
    process.platform === 'darwin'
      ? ['open', [link]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '""', link]]
        : ['xdg-open', [link]];
  try {
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
    child.on('error', () => undefined);
    child.unref();
  } catch {
    /* no browser here - the printed link is enough */
  }
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Poll until the user approves (or denies, or the link expires). */
export const waitForApproval = async (
  url: string,
  start: StartResponse,
  pollMs?: number,
): Promise<BrowserLoginResult> => {
  const every = pollMs ?? Math.max(1, start.pollIntervalSeconds ?? 2) * 1000;
  const deadline = start.expiresAt
    ? new Date(start.expiresAt).getTime()
    : Date.now() + 10 * 60_000;
  while (Date.now() < deadline + every) {
    await sleep(every);
    let poll: PollResponse;
    try {
      poll = await pollBrowserLogin(url, start.sessionId);
    } catch {
      continue; // a network blip must not end the login
    }
    if (poll.status === 'approved' && poll.token && poll.key) {
      return { token: poll.token, key: poll.key };
    }
    if (poll.status === 'denied') {
      throw new Error('The login was denied in the browser.');
    }
    if (poll.status === 'expired') {
      break;
    }
  }
  throw new Error('The login link expired. Run `gcli login` again.');
};

export const browserLogin = async (
  url: string,
  options: {
    openBrowser?: boolean;
    print?: (line: string) => void;
    pollMs?: number;
  } = {},
): Promise<BrowserLoginResult> => {
  const print = options.print ?? ((line: string) => Logger.log(line));
  const start = await startBrowserLogin(url);
  print('');
  print('Log in to Lambforge from your browser:');
  print(`  ${start.verificationUrl}`);
  print(`  Code: ${start.userCode}  (check it matches the page)`);
  print('');
  if (options.openBrowser !== false) {
    openInBrowser(start.verificationUrl);
  }
  print('Waiting for approval... (Ctrl+C to cancel)');
  return waitForApproval(url, start, options.pollMs);
};
