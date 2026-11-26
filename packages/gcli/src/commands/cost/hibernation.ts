import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { CostAPI, ProjectHibernation } from '~/services/cost-optimization';
import { ui } from '~/services/ui';

import {
  HibernationOptions,
  hibernationRow,
  toHibernationInput,
} from './parse';

const show = (json?: boolean) => (h: ProjectHibernation) =>
  json ? ui.print(JSON.stringify(h, null, 2)) : ui.table([hibernationRow(h)]);

/** gcli project:hibernation [--enable|--disable] [--timezone] [--days] [--wake] [--sleep] */
export default (
  cmd: HibernationOptions & { project?: string; json?: boolean },
) => {
  const input = toHibernationInput(cmd);
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        input
          ? CostAPI.setHibernation(projectId, input)
          : CostAPI.hibernation(projectId),
      ),
      tap(show(cmd.json)),
    ),
  );
};

/** gcli project:sleep - asleep until the next wake time */
export const sleepNow = (cmd: { project?: string; json?: boolean }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) => CostAPI.hibernateNow(projectId)),
      tap((h) =>
        ui.success(
          `asleep until ${h.overrideUntil ?? 'the next wake time'}`,
          'hibernation',
        ),
      ),
      tap(show(cmd.json)),
    ),
  );

/** gcli project:wake - awake until the next sleep time */
export const wakeNow = (cmd: { project?: string; json?: boolean }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) => CostAPI.wakeNow(projectId)),
      tap((h) =>
        ui.success(
          `awake until ${h.overrideUntil ?? 'the next sleep time'}`,
          'hibernation',
        ),
      ),
      tap(show(cmd.json)),
    ),
  );
