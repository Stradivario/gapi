import { Container, GRAPHQL_PLUGIN_CONFIG } from '@gapi/core';
import { Service } from '@rxdi/core';
import { sendRequest } from '@rxdi/graphql';

import { IQuery } from '../../../daemon-server/api-introspection';

@Service()
export class DaemonExecutorService {
  daemonLink = 'http://localhost:42000/graphql';
  getLinkList() {
    Container.set(GRAPHQL_PLUGIN_CONFIG, {});
    return sendRequest<IQuery>(
      {
        query: `
              query {
                getLinkList {
                  repoPath
                  introspectionPath
                  linkName
                  serverMetadata {
                    port
                  }
                }
              }
            `
      },
      this.daemonLink
    );
  }
}
