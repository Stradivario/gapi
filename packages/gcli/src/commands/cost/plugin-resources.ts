import { lastValueFrom } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { CostAPI } from '~/services/cost-optimization';
import { ui } from '~/services/ui';

import { pluginResources, recommendationRow } from './parse';

export interface PluginResourcesOptions {
  project?: string;
  name?: string;
  days?: string;
  apply?: boolean;
  json?: boolean;
}

/** gcli plugin:resources [--name redis-plugin] [--apply] [--days 7] [--json] */
export default (cmd: PluginResourcesOptions) => {
  if (cmd.apply && !cmd.name) throw new Error('--apply needs --name <plugin>');
  const days = cmd.days ? Number(cmd.days) : undefined;
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        CostAPI.pluginRecommendations(projectId, days).pipe(
          map((all) =>
            cmd.name ? all.filter((r) => r.pluginName === cmd.name) : all,
          ),
          switchMap((rows) => {
            if (!cmd.apply) return [rows];
            const [r] = rows;
            if (!r) {
              throw new Error(`No measurements for plugin "${cmd.name}" yet`);
            }
            if (!r.confident) {
              throw new Error(
                `${r.pluginName}: under a day of measurements (${r.hours} h) - try again later`,
              );
            }
            return CostAPI.installedPluginResources(projectId).pipe(
              map(
                (installs) =>
                  installs.find(
                    (i) =>
                      i.plugin?.name === r.pluginName &&
                      (i.clusterId ?? '') === (r.clusterId ?? ''),
                  )?.resources ?? null,
              ),
              switchMap((current) =>
                CostAPI.updatePluginSettings(
                  projectId,
                  r.pluginName,
                  r.clusterId ?? undefined,
                  { resources: pluginResources(r, current) },
                ),
              ),
              tap((res) =>
                ui.success(
                  `${r.pluginName} now reserves ${res.resources?.minCpu}m CPU and ${res.resources?.minMemory} MB (instances restart one at a time)`,
                  'plugins',
                ),
              ),
              map(() => rows),
            );
          }),
        ),
      ),
      tap((rows) => {
        if (cmd.json) return ui.print(JSON.stringify(rows, null, 2));
        if (!rows.length) {
          return ui.info(
            'No measurements yet - the cluster agent records them while plugins run (a plugin installed on two clusters is left out).',
            'plugins',
          );
        }
        ui.table(rows.map(recommendationRow));
      }),
    ),
  );
};

/** gcli plugin:auto-grow <plugin> --on | --off [--clusterId id] */
export const autoGrow = (
  plugin: string,
  cmd: { project?: string; on?: boolean; off?: boolean; clusterId?: string },
) => {
  if (!!cmd.on === !!cmd.off) throw new Error('Pass --on or --off');
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        CostAPI.updatePluginSettings(projectId, plugin, cmd.clusterId, {
          autoGrowStorage: !!cmd.on,
        }),
      ),
      tap((res) =>
        ui.success(
          res.autoGrowStorage === false
            ? `${plugin}: the volume only warns at 80 % / 90 % full`
            : `${plugin}: the volume grows to the next size by itself at 90 % full`,
          'plugins',
        ),
      ),
    ),
  );
};
