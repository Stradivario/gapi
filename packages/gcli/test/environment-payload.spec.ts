import { environmentPayload } from '~/commands/environment/environment-payload';

describe('environmentPayload', () => {
  it('sends numeric flags as numbers (commander gives strings)', () => {
    expect(
      environmentPayload({}, { name: 'static', poolSize: '0', minCpu: '30' }),
    ).toEqual({ name: 'static', poolSize: 0, minCpu: 30 });
  });

  it('never sends the CLI-only options', () => {
    const payload = environmentPayload(
      { name: 'from-spec', image: 'rxdi/fission-nodejs-static:0.0.3' },
      { spec: 'lambforge.yaml', project: 'p1', clusterName: 'free-sandbox' },
    );
    expect(payload).toEqual({
      name: 'from-spec',
      image: 'rxdi/fission-nodejs-static:0.0.3',
    });
  });

  it('flags win over the spec, unset flags do not erase it', () => {
    expect(
      environmentPayload(
        { name: 'nodejs', poolSize: 3, builder: 'b:1' },
        { poolSize: '1', builder: undefined },
      ),
    ).toEqual({ name: 'nodejs', poolSize: 1, builder: 'b:1' });
  });

  it('refuses a number that is not one', () => {
    expect(() => environmentPayload({}, { maxPods: 'ten' })).toThrow(
      '--maxPods must be a whole number, got "ten"',
    );
  });
});
