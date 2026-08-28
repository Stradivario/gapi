import { lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { loadSpec } from '../lambda/helpers/load-spec';

interface PluginYamlSpec {
  name: string;
  clusterId?: string;
  config?: Record<string, unknown>;
}

export default (cmd: {
  spec?: string;
  project?: string;
  name?: string;
  cluster?: string;
}) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        loadSpec<{ plugin?: PluginYamlSpec } & Partial<PluginYamlSpec>>(
          cmd.spec ?? 'plugin.yaml',
        ).pipe(
          // No spec file is required at all if --name/--cluster fully
          // cover it (unlike every other resource here, a plugin install
          // is often just "install this by name", no YAML needed).
          catchError(() => of(undefined)),
          map((data) => ({
            projectId,
            ...(data ? (data.plugin ?? data) : {}),
          })),
        ),
      ),
      switchMap(({ projectId, ...data }) =>
        GraphqlClienAPI.installPlugin(
          projectId,
          cmd.name || data.name,
          data.config,
          cmd.cluster || data.clusterId,
        ),
      ),
      tap((installed) => {
        Logger.log('-------------------');
        Logger.log('[Action][installPlugin]');
        Logger.table([installed]);
        Logger.log('-------------------');
      }),
    ),
  );
