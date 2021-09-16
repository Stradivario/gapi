import { writeFile } from 'fs';
import { from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { promisify } from 'util';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { projectDirectory } from '~/types';

export default async (cmd: string) => {
  return parseProjectId(cmd)
    .pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.getProject(projectId).pipe(map(() => projectId)),
      ),
      switchMap((projectId) =>
        from(
          promisify(writeFile)(projectDirectory, projectId, {
            encoding: 'utf-8',
          }),
        ),
      ),
    )
    .toPromise();
};
