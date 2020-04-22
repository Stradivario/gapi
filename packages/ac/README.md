```ts
import { AccessControl, Union } from '@gapi/ac';

enum GraphqlActions {
  query,
  mutation,
  subscription,
  event,
}

enum Roles {
  GUEST,
  USER,
  ADMIN,
}

interface IQuery {
  status: {
    status: number;
  };
}

const Permissions: Union<typeof Roles, IQuery, typeof GraphqlActions> = {
  GUEST: {
    status: {
      query: {
        enabled: false,
      },
    },
  },
  USER: {
    status: {
      query: {
        enabled: true,
        attributes: {
          status: false,
        },
      },
    },
  },
  ADMIN: {
    status: {
      query: {
        enabled: true,
      },
    },
  },
};

const ac = new AccessControl<
  typeof Roles,
  IQuery & ISubscription & IMutation,
  typeof GraphqlActions
>(Permissions);

const canAdminQueryStatus = ac.can('ADMIN', 'query', 'status');
const canAdminQueryStatus = ac.can('USER', 'query', 'status');

if (!canAdminQueryStatus) {
  throw new Error('You are not authorized');
}

const data = { status: 200 };
const filteredData = await ac.filter('USER', 'query', 'status')(data);
filteredData; // { status: null }
```
