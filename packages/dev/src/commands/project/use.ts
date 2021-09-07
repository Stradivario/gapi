import { Command } from 'commander';
import { writeFile } from 'fs';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { promisify } from 'util';

import { parseProjectId } from '~/helpers';
import { projectDirectory } from '~/types';

export default async (cmd: Command) =>
  parseProjectId(cmd.project || cmd)
    .pipe(
      switchMap((projectId) =>
        from(
          promisify(writeFile)(projectDirectory, projectId, {
            encoding: 'utf-8',
          }),
        ),
      ),
    )
    .toPromise();
