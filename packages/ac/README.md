The @gapi/ac library is an access control utility designed for use in GraphQL applications. It helps developers manage permissions for different user roles, such as GUEST, USER, and ADMIN, across various GraphQL actions like queries, mutations, subscriptions, and events. It allows developers to define and enforce rules for which roles can access or manipulate specific resources in the system.

Key features include:

Role-based permissions: You can define access control based on user roles (like GUEST, USER, ADMIN) and control what actions they can perform.
GraphQL-focused: Specifically built to handle permissioning in GraphQL, making it a natural fit for applications using this API standard.
Filtering data: The library allows filtering data based on user roles, so different roles see only the data they are authorized to access.
For example, an admin might have access to query a certain data field (status), while a regular user might have partial access, where some attributes of the response are filtered out based on the permission definitions.

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
