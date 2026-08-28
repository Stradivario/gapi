import { lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

export default () =>
  lastValueFrom(
    GraphqlClienAPI.listAvailablePlugins().pipe(
      tap((plugins) => {
        Logger.log('-------------------');
        Logger.log('[Action][listAvailablePlugins]');
        Logger.table(
          (plugins || []).map((p) => ({
            name: p.name,
            pluginType: p.pluginType,
            isActive: p.isActive,
            description: p.description,
          })),
        );
        Logger.log('-------------------');
      }),
    ),
  );
