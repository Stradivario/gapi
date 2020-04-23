import 'jest';

import { AccessControl } from '../src/index';
import { Union } from '../src/types';

enum Actions {
  query,
  mutation,
  subscription,
}

interface Resolvers {
  cli: {
    omg: boolean;
  };
  cli_arrray: [
    {
      omg2: boolean;
    },
  ];
}

enum Roles {
  USER,
  ADMIN,
}

describe('[AccessControl]', () => {
  const Permissions: Union<typeof Roles, Resolvers, typeof Actions> = {
    USER: {
      cli: {
        query: {
          enabled: false,
          attributes: {
            omg: true,
          },
        },
      },
    },
    ADMIN: {
      cli: {
        query: {
          enabled: true,
          attributes: {
            omg: false,
          },
        },
      },
      cli_arrray: {
        query: {
          enabled: true,
          attributes: {
            omg2: false,
          },
        },
      },
    },
  };
  it('Should test basic features', async () => {
    const ac = new AccessControl<typeof Roles, Resolvers, typeof Actions>(
      Permissions,
    );
    const canAdminReadMachines = ac.can('ADMIN', 'query', 'cli');
    const canUserReadMachines = ac.can('USER', 'query', 'cli');
    const canAdminReadCliArray = ac.can('ADMIN', 'query', 'cli_arrray');

    expect(canAdminReadMachines).toBeTruthy();
    expect(canUserReadMachines).toBeFalsy();
    expect(canAdminReadCliArray).toBeTruthy();

    const data = { omg2: 'edno' };
    const filtered = await ac.filter('ADMIN', 'query', 'cli_arrray')(data);
    expect(filtered.omg2).toBeFalsy();
  });
});
