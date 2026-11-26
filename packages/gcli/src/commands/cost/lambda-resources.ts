import { lastValueFrom } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { CostAPI, LambdaRecommendation } from '~/services/cost-optimization';
import { ui } from '~/services/ui';

import { recommendationRow, yamlSnippet } from './parse';

export interface LambdaResourcesOptions {
  project?: string;
  name?: string;
  days?: string;
  auto?: boolean;
  fixed?: boolean;
  json?: boolean;
}

/** gcli lambda:resources [--name n] [--auto | --fixed] [--days 7] [--json] */
export default (cmd: LambdaResourcesOptions) => {
  if (cmd.auto && cmd.fixed)
    throw new Error('Pass --auto or --fixed, not both');
  if ((cmd.auto || cmd.fixed) && !cmd.name) {
    throw new Error('--auto / --fixed need --name <lambda>');
  }
  const days = cmd.days ? Number(cmd.days) : undefined;
  return lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        CostAPI.lambdaRecommendations(projectId, days).pipe(
          map((all) =>
            cmd.name ? all.filter((r) => r.lambdaName === cmd.name) : all,
          ),
          switchMap((rows) => {
            if (!cmd.auto && !cmd.fixed) return [rows];
            const [r] = rows;
            if (!r) {
              throw new Error(
                `No measurements for lambda "${cmd.name}" yet (the cluster agent records them while it runs)`,
              );
            }
            const mode: 'auto' | 'fixed' = cmd.auto ? 'auto' : 'fixed';
            return CostAPI.setLambdaResourcesMode(
              projectId,
              r.lambdaId,
              mode,
            ).pipe(
              tap(() =>
                ui.success(
                  mode === 'auto'
                    ? `${r.lambdaName} is sized automatically from now on (at most once a day, within the plan)`
                    : `${r.lambdaName}: recommendations only`,
                  'resources',
                ),
              ),
              map((): LambdaRecommendation[] => [{ ...r, mode }]),
            );
          }),
        ),
      ),
      tap((rows) => {
        if (cmd.json) return ui.print(JSON.stringify(rows, null, 2));
        if (!rows.length) {
          return ui.info(
            'No measurements yet - the cluster agent records them while lambdas run.',
            'resources',
          );
        }
        ui.table(rows.map(recommendationRow));
        const changes = rows.filter(
          (r) =>
            r.confident &&
            r.mode !== 'auto' &&
            (r.cpu.action !== 'keep' || r.memory.action !== 'keep'),
        );
        if (changes.length && !cmd.auto) {
          ui.info(
            'Apply in lambforge.yaml and deploy (a deploy from the yaml sets these values), or keep one sized automatically with --name <lambda> --auto:',
            'resources',
          );
          ui.print(changes.map(yamlSnippet).join('\n\n'));
        }
      }),
    ),
  );
};
