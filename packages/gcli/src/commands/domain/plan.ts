import { DomainConfig } from '~/commands/lambda/helpers/load-spec';
import { DomainRouting, ProjectDomain } from '~/services/gql-client';

/** What `domains:` in lambforge.yaml asks for one entry (feature
    customer-domains): claim a platform name / add a custom domain when the
    project has none, then routing - or nothing when it already matches. */
export interface DomainStep {
  /** platform name (`acme`) or hostname (`api.example.com`) */
  label: string;
  existing?: ProjectDomain;
  create?: 'claim' | 'add';
  routing: DomainRouting;
  /** the routing on the server already matches */
  same: boolean;
}

const SERVES: Record<string, DomainRouting['routeMode']> = {
  all: 'all',
  'full-path': 'passthrough',
};

/** The entry's routing with lambda names resolved to ids. */
export function routingOf(
  entry: DomainConfig,
  lambdaIds: Map<string, string>,
  defaultLambda?: string,
): DomainRouting {
  const id = (name: string, what: string) => {
    const found = lambdaIds.get(name);
    if (!found) {
      throw new Error(`domains: ${what} - no lambda "${name}" in this project`);
    }
    return found;
  };
  const serves = entry.serves ?? defaultLambda;
  const routeMode = SERVES[serves] ?? 'prefix';
  if (routeMode === 'prefix' && !serves) {
    throw new Error(
      `domains: "${entry.name ?? entry.host}" - set \`serves\` (a lambda name, all or full-path)`,
    );
  }
  return {
    routeMode,
    lambdaId:
      routeMode === 'prefix'
        ? id(serves, `"${entry.name ?? entry.host}"`)
        : null,
    paths: Object.entries(entry.paths ?? {})
      .map(([prefix, lambda]) => ({
        prefix: prefix.trim().replace(/\/+$/, ''),
        lambdaId: id(lambda, `path ${prefix}`),
      }))
      .sort((a, b) => a.prefix.localeCompare(b.prefix)),
  };
}

/** The project's domain an entry means: by hostname, or a platform name
    whose first label is `name`. */
export function existingFor(
  entry: DomainConfig,
  domains: ProjectDomain[],
): ProjectDomain | undefined {
  return entry.host
    ? domains.find((d) => d.hostname === entry.host.trim().toLowerCase())
    : domains.find(
        (d) =>
          d.platform &&
          d.hostname.split('.')[0] === entry.name?.trim().toLowerCase(),
      );
}

const sameRouting = (d: ProjectDomain, r: DomainRouting) =>
  d.routeMode === r.routeMode &&
  (r.routeMode !== 'prefix' || d.lambdaId === r.lambdaId) &&
  JSON.stringify(
    [...(d.paths ?? [])]
      .map((p) => ({ prefix: p.prefix, lambdaId: p.lambdaId }))
      .sort((a, b) => a.prefix.localeCompare(b.prefix)),
  ) === JSON.stringify(r.paths);

export function domainStep(
  entry: DomainConfig,
  domains: ProjectDomain[],
  lambdaIds: Map<string, string>,
  defaultLambda?: string,
): DomainStep {
  if (!entry?.name === !entry?.host) {
    throw new Error(
      'domains: every entry needs exactly one of `name` (a platform name) or `host` (your own domain)',
    );
  }
  const routing = routingOf(entry, lambdaIds, defaultLambda);
  const existing = existingFor(entry, domains);
  return {
    label: entry.name ?? entry.host,
    existing,
    create: existing ? undefined : entry.name ? 'claim' : 'add',
    routing,
    same: !!existing && sameRouting(existing, routing),
  };
}
