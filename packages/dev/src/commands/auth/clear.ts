import { unlink } from 'fs';
import { from } from 'rxjs';
import { promisify } from 'util';

import { projectDirectory } from '~/types';

export default async () =>
  from(promisify(unlink)(projectDirectory)).toPromise();
