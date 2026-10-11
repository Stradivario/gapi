import { lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

export default () =>
  lastValueFrom(
    GraphqlClienAPI.listLocalRunners().pipe(
      tap((runners) => {
        Logger.log('-------------------');
        Logger.log('[Action][listLocalRunners]');
        if (!runners?.length) {
          Logger.info(
            'No local runners yet. Run `gcli runner:start` on the machine that runs Ollama.',
          );
        } else {
          Logger.table(
            runners.map((r) => ({
              id: r.id,
              name: r.name,
              online: r.online,
              lastSeenAt: r.lastSeenAt,
              models: (r.models ?? []).map((m) => m.name).join(', '),
            })),
          );
        }
        Logger.log('-------------------');
      }),
    ),
  );
