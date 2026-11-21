import { domainStep, routingOf } from '../src/commands/domain/plan';
import { ProjectDomain } from '../src/services/gql-client';

const lambdas = new Map([
  ['site', 'id-site'],
  ['api', 'id-api'],
]);
const domain = (d: Partial<ProjectDomain>): ProjectDomain => ({
  id: 'd1',
  hostname: 'pesho.lambforge.app',
  status: 'active',
  routeMode: 'all',
  platform: true,
  paths: [],
  ...d,
});

describe('domains: in lambforge.yaml (feature customer-domains)', () => {
  it("serves: a lambda name, all, full-path - default this file's lambda", () => {
    expect(routingOf({ name: 'pesho', serves: 'all' }, lambdas)).toEqual({
      routeMode: 'all',
      lambdaId: null,
      paths: [],
    });
    expect(
      routingOf({ host: 'x.com', serves: 'full-path' }, lambdas).routeMode,
    ).toBe('passthrough');
    expect(routingOf({ name: 'pesho' }, lambdas, 'site')).toEqual({
      routeMode: 'prefix',
      lambdaId: 'id-site',
      paths: [],
    });
  });

  it('paths: prefix -> lambda name, trailing slashes dropped, sorted', () => {
    expect(
      routingOf(
        {
          name: 'p',
          serves: 'all',
          paths: { '/docs/': 'site', '/api': 'api' },
        },
        lambdas,
      ).paths,
    ).toEqual([
      { prefix: '/api', lambdaId: 'id-api' },
      { prefix: '/docs', lambdaId: 'id-site' },
    ]);
  });

  it('refuses unknown lambdas, both or neither of name/host, and no serves at all', () => {
    expect(() => routingOf({ name: 'p', serves: 'nope' }, lambdas)).toThrow(
      'no lambda "nope"',
    );
    expect(() =>
      domainStep({ name: 'p', host: 'x.com', serves: 'all' }, [], lambdas),
    ).toThrow('exactly one');
    expect(() => domainStep({ serves: 'all' }, [], lambdas)).toThrow(
      'exactly one',
    );
    expect(() => routingOf({ name: 'p' }, lambdas)).toThrow('set `serves`');
  });

  it('claims a new platform name, adds a new custom domain', () => {
    expect(
      domainStep({ name: 'pesho', serves: 'all' }, [], lambdas).create,
    ).toBe('claim');
    expect(
      domainStep({ host: 'API.Example.com', serves: 'api' }, [], lambdas)
        .create,
    ).toBe('add');
  });

  it('an existing domain with the same routing is up to date; another routing is applied', () => {
    const existing = [
      domain({
        paths: [{ prefix: '/api', lambdaId: 'id-api', lambdaName: 'api' }],
      }),
    ];
    const same = domainStep(
      { name: 'pesho', serves: 'all', paths: { '/api': 'api' } },
      existing,
      lambdas,
    );
    expect(same).toMatchObject({ create: undefined, same: true });
    const changed = domainStep(
      { name: 'pesho', serves: 'site' },
      existing,
      lambdas,
    );
    expect(changed).toMatchObject({ create: undefined, same: false });
    expect(changed.routing).toEqual({
      routeMode: 'prefix',
      lambdaId: 'id-site',
      paths: [],
    });
  });

  it('a host matches its own domain, a name only a platform name', () => {
    const existing = [
      domain({
        id: 'c',
        hostname: 'pesho.example.com',
        platform: false,
        routeMode: 'prefix',
        lambdaId: 'id-api',
      }),
    ];
    expect(
      domainStep({ name: 'pesho', serves: 'all' }, existing, lambdas).create,
    ).toBe('claim');
    expect(
      domainStep(
        { host: 'pesho.example.com', serves: 'api' },
        existing,
        lambdas,
      ),
    ).toMatchObject({
      same: true,
    });
  });
});
