import { deployStateOf } from '~/commands/lambda/helpers/deploy-state';

/** Feature cli-output: what `lambda:update` waits for. */
describe('deployStateOf', () => {
  it('building = deploying, with the build status', () => {
    expect(
      deployStateOf({ ready: false, status: 'running' }, undefined),
    ).toEqual({ state: 'DEPLOYING', status: 'running' });
  });

  it('built but not rolled out yet = still deploying', () => {
    expect(
      deployStateOf({ ready: true, status: 'succeeded' }, 'DEPLOYING'),
    ).toEqual({ state: 'DEPLOYING', status: 'rolling out' });
  });

  it('built and LIVE (or an API without deployStatus) = live', () => {
    expect(deployStateOf({ ready: true }, 'LIVE').state).toBe('LIVE');
    expect(deployStateOf({ ready: true }, null).state).toBe('LIVE');
  });

  it('a failed build or a failed rollout = failed', () => {
    expect(deployStateOf({ failed: true }, 'DEPLOYING').state).toBe('FAILED');
    expect(deployStateOf({ ready: true }, 'FAILED').state).toBe('FAILED');
  });
});
