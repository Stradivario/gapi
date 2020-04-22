import 'jest';

import { AccessControl } from '../src/index';
import { Union } from '../src/types';

enum Actions {
  edit,
  read,
  delete,
  write,
}
enum Resolvers {
  cli,
}

enum Roles {
  USER,
  ADMIN,
}

describe('[AccessControl]', () => {
  const Permissions: Union<typeof Roles, typeof Resolvers, typeof Actions> = {
    USER: {
      cli: {
        delete: false,
      },
    },
    ADMIN: {
      cli: {
        delete: true,
      },
    },
  };
  it('Should test basic features', async () => {
    const ac = new AccessControl(Permissions);
    const canAdminReadMachines = ac.can('ADMIN', 'delete', 'cli');
    const canUserReadMachines = ac.can('USER', 'delete', 'cli');

    expect(canAdminReadMachines).toBeTruthy();
    expect(canUserReadMachines).toBeFalsy();
  });
});
