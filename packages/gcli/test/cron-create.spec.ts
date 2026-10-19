import 'jest';

jest.mock('../src/services/gql-client', () => ({
  GraphqlClienAPI: { getLambdaByName: jest.fn(), createTimeTrigger: jest.fn() },
}));
jest.mock('../src/helpers', () => ({ parseProjectId: jest.fn() }));
jest.mock('../src/commands/lambda/helpers/load-spec', () => ({
  loadSpec: jest.fn(),
}));

import { of } from 'rxjs';

import { loadSpec } from '../src/commands/lambda/helpers/load-spec';
import createCron from '../src/commands/triggers/cron/create-cron';
import { parseProjectId } from '../src/helpers';
import { GraphqlClienAPI } from '../src/services/gql-client';

const api = GraphqlClienAPI as unknown as Record<string, jest.Mock>;

describe('[cron:create]', () => {
  beforeEach(() => {
    Object.values(api).forEach((m) => m.mockReset());
    (parseProjectId as jest.Mock).mockReturnValue(of('proj-1'));
    api.getLambdaByName.mockReturnValue(of({ id: 'l1', name: 'api' }));
    api.createTimeTrigger.mockImplementation((input) =>
      of({ id: 't1', ...input }),
    );
    jest.spyOn(console, 'table').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('uses the --cron and --triggerName flags (they were ignored before)', async () => {
    (loadSpec as jest.Mock).mockReturnValue(of(false));
    await createCron({
      lambdaName: 'api',
      triggerName: 'nightly',
      cron: '0 2 * * *',
    });
    expect(api.createTimeTrigger).toHaveBeenCalledWith({
      lambdaId: 'l1',
      triggerName: 'nightly',
      cron: '0 2 * * *',
    });
  });

  it('flags win over lambforge.yaml triggers.time, which fills the gaps', async () => {
    (loadSpec as jest.Mock).mockReturnValue(
      of({
        function: { name: 'api' },
        triggers: { time: { cron: '@daily', triggerName: 'from-yaml' } },
      }),
    );
    await createCron({ cron: '@every 5m' });
    expect(api.getLambdaByName).toHaveBeenCalledWith('api', 'proj-1');
    expect(api.createTimeTrigger).toHaveBeenCalledWith({
      lambdaId: 'l1',
      triggerName: 'from-yaml',
      cron: '@every 5m',
    });
  });

  it('explains a missing schedule instead of sending an empty one', async () => {
    (loadSpec as jest.Mock).mockReturnValue(of(false));
    await expect(createCron({ lambdaName: 'api' })).rejects.toThrow(
      'needs --cron and --triggerName',
    );
    expect(api.createTimeTrigger).not.toHaveBeenCalled();
  });
});
