const fetchMock = jest.fn();
global.fetch = fetchMock as never;
jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({ on: jest.fn(), unref: jest.fn() })),
}));

import { spawn } from 'child_process';

import { browserLogin } from '~/commands/auth/browser-login';

const reply = (data: unknown) => ({
  status: 200,
  json: async () => ({ data }),
});
const start = {
  startCliLogin: {
    sessionId: 'secret-session',
    userCode: 'ABCD-EFGH',
    verificationUrl: 'https://lambforge.com/cli-login?code=ABCD-EFGH',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    pollIntervalSeconds: 2,
  },
};
const lines: string[] = [];
const print = (l: string) => lines.push(l);

describe('gcli login through the browser', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    lines.length = 0;
    (spawn as jest.Mock).mockClear();
  });

  it('prints the link and code, opens the browser and returns the token once approved', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(start))
      .mockResolvedValueOnce(reply({ pollCliLogin: { status: 'pending' } }))
      .mockRejectedValueOnce(new Error('ECONNRESET')) // a blip keeps waiting
      .mockResolvedValueOnce(
        reply({ pollCliLogin: { status: 'approved', token: 't', key: 'k' } }),
      );
    await expect(
      browserLogin('https://api.example', { print, pollMs: 1 }),
    ).resolves.toEqual({ token: 't', key: 'k' });
    expect(lines.join('\n')).toContain(start.startCliLogin.verificationUrl);
    expect(lines.join('\n')).toContain('ABCD-EFGH');
    expect(spawn).toHaveBeenCalledTimes(1);
    // the session id goes only to the API, never to the screen
    expect(lines.join('\n')).not.toContain('secret-session');
    // no Authorization header: the CLI has no token yet
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('stops on deny and does not open a browser with --no-browser', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(start))
      .mockResolvedValueOnce(reply({ pollCliLogin: { status: 'denied' } }));
    await expect(
      browserLogin('https://api.example', {
        print,
        pollMs: 1,
        openBrowser: false,
      }),
    ).rejects.toThrow('denied');
    expect(spawn).not.toHaveBeenCalled();
  });

  it('reports an expired link', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(start))
      .mockResolvedValueOnce(reply({ pollCliLogin: { status: 'expired' } }));
    await expect(
      browserLogin('https://api.example', { print, pollMs: 1 }),
    ).rejects.toThrow('expired');
  });
});
