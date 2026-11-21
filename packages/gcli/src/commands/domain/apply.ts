import { concat, lastValueFrom, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap, toArray } from 'rxjs/operators';

import { DomainConfig, loadSpec } from '~/commands/lambda/helpers/load-spec';
import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI, ProjectDomain } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { DomainStep, domainStep } from './plan';

/** What the user has to do or see after a domain is applied. */
export const reportDomain = (d: ProjectDomain) => {
  Logger.info(`${d.hostname}  (${d.status})`);
  if (d.status !== 'active' && !d.platform && !d.ownZone && d.cnameTarget) {
    Logger.info(
      `  set at your DNS provider: CNAME ${d.hostname} -> ${d.cnameTarget}`,
    );
    for (const v of d.verification ?? []) {
      Logger.info(`  and: ${v.type.toUpperCase()} ${v.name} -> ${v.value}`);
    }
  }
  if (d.error) Logger.error(`  ${d.error}`);
};

const runStep = (
  projectId: string,
  step: DomainStep,
): Observable<ProjectDomain> => {
  const { routing } = step;
  const firstLambda = routing.lambdaId ?? routing.paths[0]?.lambdaId;
  const created$: Observable<ProjectDomain> =
    step.create === 'claim'
      ? GraphqlClienAPI.claimPlatformName(
          projectId,
          step.label,
          routing.routeMode === 'all' ? 'all' : 'prefix',
          routing.routeMode === 'all' ? undefined : firstLambda,
        )
      : step.create === 'add'
        ? firstLambda
          ? GraphqlClienAPI.addProjectDomain(projectId, step.label, firstLambda)
          : (() => {
              throw new Error(
                `domains: "${step.label}" needs a lambda to start with - set \`serves\` or a path`,
              );
            })()
        : of(step.existing);
  return created$.pipe(
    switchMap((domain) =>
      step.same ||
      // routing applies to a live domain; a new custom domain gets it on the
      // next apply, once it is verified
      domain.status !== 'active'
        ? of(domain)
        : GraphqlClienAPI.setDomainRouting(domain.id, routing),
    ),
  );
};

/**
 * Brings the project's domains to `domains:` of lambforge.yaml: claims the
 * platform names and adds the custom domains it does not have yet, then sets
 * their routing. Safe on every deploy; never removes a domain the file does
 * not mention (domain:remove).
 */
export const applyDomains = (
  projectId: string,
  entries: DomainConfig[],
  defaultLambda?: string,
): Observable<ProjectDomain[]> =>
  !entries?.length
    ? of([])
    : GraphqlClienAPI.listProjectDomains(projectId).pipe(
        switchMap((domains) =>
          GraphqlClienAPI.listLambdas(projectId).pipe(
            map((lambdas) => ({
              domains,
              lambdaIds: new Map(
                (lambdas ?? []).map((l) => [l.name as string, l.id as string]),
              ),
            })),
          ),
        ),
        switchMap(({ domains, lambdaIds }) =>
          concat(
            ...entries.map((entry) =>
              of(entry).pipe(
                map((e) => domainStep(e, domains, lambdaIds, defaultLambda)),
                switchMap((step) =>
                  runStep(projectId, step).pipe(
                    tap((d) => {
                      if (step.same && !step.create) {
                        Logger.info(`${d.hostname} is up to date`);
                      } else {
                        reportDomain(d);
                      }
                    }),
                  ),
                ),
              ),
            ),
          ),
        ),
        toArray(),
      );

export default (cmd: { project?: string; spec?: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        loadSpec(cmd.spec).pipe(
          switchMap((spec) => {
            const entries = spec?.domains ?? [];
            if (!entries.length) {
              throw new Error(
                'domain:apply needs `domains:` in lambforge.yaml',
              );
            }
            return applyDomains(projectId, entries, spec?.function?.name);
          }),
        ),
      ),
      catchError((e) => {
        Logger.error((e as Error)?.message ?? String(e));
        throw e;
      }),
    ),
  );
