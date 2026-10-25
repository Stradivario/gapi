import { tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { taskLambdas } from './definition';
import { withProject } from './helpers';

export default (cmd: { project?: string }) =>
  withProject(cmd.project, (projectId) =>
    GraphqlClienAPI.listWorkflows(projectId).pipe(
      tap((workflows) => {
        if (!workflows.length) {
          Logger.info(
            'No workflows yet. Draft one with workflow:generate, or write a file and workflow:apply it.',
          );
          return;
        }
        Logger.table(
          workflows.map((w) => ({
            name: w.name,
            steps: Object.keys(w.definition?.states ?? {}).length,
            lambdas: taskLambdas(w.definition).join(', '),
            description: w.description ?? '',
            updated: w.updatedAt ?? '',
          })),
        );
      }),
    ),
  );
