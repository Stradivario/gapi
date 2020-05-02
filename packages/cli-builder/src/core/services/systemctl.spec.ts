import 'jest';

import { Container } from '@rxdi/core';

import { SystemctlService } from './systemctl';
describe('[SystemCTL]: tests', () => {
  const systemctl = Container.get(SystemctlService);

  it('Should parse correct configuration', async () => {
    const config = systemctl.generateConfig();
    console.log(config);
    expect(
      config.includes('GRAPHQL_RUNNER_API_PORT=42043')
    ).toBeTruthy();
    expect(
      config.includes('GRAPHQL_RUNNER_GRAPHIQL=true')
    ).toBeTruthy();
    expect(
      config.includes('GRAPHQL_RUNNER_TYPE=true')
    ).toBeTruthy();
    expect(
      config.includes('WantedBy=multi-user.target')
    ).toBeTruthy();
  });
});
