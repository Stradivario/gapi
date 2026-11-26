import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { CostAPI } from '~/services/cost-optimization';
import { ui } from '~/services/ui';

/** gcli project:savings [--json] - what the platform saved this month */
export default (cmd: { project?: string; json?: boolean }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) => CostAPI.savings(projectId)),
      tap((s) => {
        if (cmd.json) return ui.print(JSON.stringify(s, null, 2));
        ui.summary([
          ['Saved this month', `${s.total} ${s.currency}`],
          ['Still saving', `${s.ongoingMonthly} ${s.currency}/month`],
        ]);
        if (s.items.length) {
          ui.table(
            s.items.map((i) => ({
              kind: i.kind,
              what: i.label,
              saved: `${i.amount} ${s.currency}`,
              perMonth: i.ongoing ? `${i.monthly} ${s.currency}` : 'ended',
            })),
          );
        }
      }),
    ),
  );
