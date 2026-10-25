import { switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { WorkflowFile } from './definition';
import { readWorkflowFile, withProject } from './helpers';

/** Creates the workflow, or updates it when one with that name exists. */
export const applyWorkflow = (projectId: string, file: WorkflowFile) => {
  if (!file.name) {
    throw new Error(
      'The workflow needs a name: set `workflow.name` in the file or pass --name',
    );
  }
  return GraphqlClienAPI.listWorkflows(projectId).pipe(
    switchMap((workflows) => {
      const existing = workflows.find((w) => w.name === file.name);
      return existing
        ? GraphqlClienAPI.updateWorkflow(projectId, existing.id, {
            description: file.description,
            definition: file.definition,
          })
        : GraphqlClienAPI.createWorkflow(projectId, {
            name: file.name,
            description: file.description,
            definition: file.definition,
            clusterId: file.clusterId,
          });
    }),
    tap((w) =>
      Logger.info(
        `Workflow ${w.name} saved (${Object.keys(w.definition?.states ?? {}).length} steps). Run it: gcli workflow:run --name ${w.name} --wait`,
      ),
    ),
  );
};

export default (cmd: {
  project?: string;
  file?: string;
  name?: string;
  description?: string;
}) =>
  withProject(cmd.project, (projectId) =>
    readWorkflowFile(cmd.file).pipe(
      switchMap((file) =>
        applyWorkflow(projectId, {
          ...file,
          name: cmd.name ?? file.name,
          description: cmd.description ?? file.description,
        }),
      ),
    ),
  );
