import { Container } from '@rxdi/core';

import { BootstrapTask } from '../../tasks/bootstrap';

Container.get(BootstrapTask).run({
  server: {
    hapi: {
      port: 42000,
    },
  },
  graphql: {
    openBrowser: false,
    graphiql: false,
    graphiQlPlayground: false,
  },
});
