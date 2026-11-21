import { lastValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

const SERVES: Record<string, string> = {
  all: 'every lambda at /<route>',
  passthrough: 'full paths',
};

export default (cmd: { project?: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) => GraphqlClienAPI.listProjectDomains(projectId)),
      tap((domains) => {
        if (!domains.length) {
          Logger.info(
            'No domains yet - see domain:apply (domains: in lambforge.yaml).',
          );
          return;
        }
        Logger.table(
          domains.map((d) => ({
            domain: d.hostname,
            kind: d.platform
              ? 'platform name'
              : d.ownZone
                ? 'platform DNS'
                : 'custom',
            status: d.status,
            serves: d.lambdaName ?? SERVES[d.routeMode] ?? '-',
            paths: (d.paths ?? [])
              .map((p) => `${p.prefix} -> ${p.lambdaName ?? p.lambdaId}`)
              .join(', '),
          })),
        );
      }),
    ),
  );
