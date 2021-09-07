import { writeFile } from 'fs';
import { from } from 'rxjs';
import { promisify } from 'util';

import { projectDirectory } from '~/types';

export default async (...[projectId]) =>
  from(
    promisify(writeFile)(projectDirectory, projectId, {
      encoding: 'utf-8',
    }),
  ).toPromise();
