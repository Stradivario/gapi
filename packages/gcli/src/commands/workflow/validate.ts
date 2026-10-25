import { switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { readWorkflowFile, withProject } from './helpers';

export default (cmd: { project?: string; file?: string }) =>
  withProject(cmd.project, (projectId) =>
    readWorkflowFile(cmd.file).pipe(
      switchMap((file) =>
        GraphqlClienAPI.validateWorkflow(
          projectId,
          file.definition,
          file.clusterId,
        ),
      ),
      tap((v) =>
        Logger.info(
          `Valid. Calls: ${(v.functions ?? []).join(', ') || 'no lambdas'}`,
        ),
      ),
    ),
  );
