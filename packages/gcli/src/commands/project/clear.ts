import { unlink } from 'fs';
import { promisify } from 'util';

import { projectDirectory } from '~/types';

export default async () => promisify(unlink)(projectDirectory);
