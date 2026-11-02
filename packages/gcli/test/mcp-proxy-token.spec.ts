import { lastValueFrom, of } from 'rxjs';

import { currentToken, performFetch } from '~/commands/proxy/start';
import { GraphqlClienAPI } from '~/services/gql-client';

describe('mcp:start proxy token', () => {
  let tokens: string[];
  let getConfig: jest.SpyInstance;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    tokens = ['t1', 't2', 't3'];
    getConfig = jest
      .spyOn(GraphqlClienAPI, 'getConfig')
      .mockImplementation(() => of({ token: tokens.shift() } as never));
    fetchMock = jest.fn(async () => new Response('{}', { status: 200 }));
    global.fetch = fetchMock as never;
  });

  afterEach(() => jest.restoreAllMocks());

  const authOf = (call: number) =>
    new Headers((fetchMock.mock.calls[call][1] as RequestInit).headers).get(
      'Authorization',
    );

  it('reads the token for every request instead of the one from startup', async () => {
    await lastValueFrom(
      performFetch('http://mcp', { headers: { Authorization: 'stale' } }),
    );
    await lastValueFrom(performFetch('http://mcp'));

    expect(authOf(0)).toBe('t1');
    expect(authOf(1)).toBe('t2');
    expect(getConfig).toHaveBeenCalledTimes(2);
  });

  it('shares one refresh between concurrent requests', async () => {
    const [a, b] = await Promise.all([currentToken(), currentToken()]);

    expect(a).toBe('t1');
    expect(b).toBe('t1');
    expect(getConfig).toHaveBeenCalledTimes(1);
  });

  it('forces a refresh and retries once on 401', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));

    const res = await lastValueFrom(performFetch('http://mcp'));

    expect(res.status).toBe(200);
    expect(getConfig).toHaveBeenLastCalledWith(true);
    expect(authOf(1)).toBe('t2');
  });
});
