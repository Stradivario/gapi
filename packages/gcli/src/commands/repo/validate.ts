import { lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { discover, repoRoot, Unit, unitKey } from './discover';
import { Loose } from './drift';
import { check, Finding } from './schema-check';

/** Two units that would fight over the same lambda / route. */
export function crossChecks(units: Unit[]): Finding[] {
  const out: Finding[] = [];
  const seen = new Map<string, string>();
  for (const u of units) {
    const fn = u.spec.function;
    if (!fn?.name) continue;
    for (const [what, value] of [
      ['function.name', fn.name],
      ['function.route', fn.route],
    ]) {
      if (!value) continue;
      const key = `${what}=${value}@${fn.clusterName ?? fn.clusterId ?? 'shared'}`;
      const other = seen.get(key);
      if (other) {
        out.push({
          unit: unitKey(u),
          path: what,
          level: 'error',
          message: `"${value}" is also used by ${other}`,
        });
      } else {
        seen.set(key, unitKey(u));
      }
    }
  }
  const lambdas = new Set(
    units.map((u) => u.spec.function?.name).filter(Boolean),
  );
  for (const u of units) {
    (u.spec.domains ?? []).forEach((d: Loose, i: number) => {
      for (const name of [d?.serves, ...Object.values(d?.paths ?? {})]) {
        if (
          name &&
          !['all', 'full-path'].includes(name) &&
          !lambdas.has(name)
        ) {
          out.push({
            unit: unitKey(u),
            path: `domains[${i}]`,
            level: 'warning',
            message: `"${name}" is no lambda in this repository (fine if another repo deploys it)`,
          });
        }
      }
    });
  }
  return out;
}

/** `--online`: function / environment keys the platform's live API does not
    take and gcli does not read itself. */
const GCLI_ONLY = new Set([
  'file',
  'script',
  'package',
  'clusterName',
  'clusterId',
  'uploadAsZip',
  'static',
  'streamMultipart',
  'bodyLimit',
  'terminationGracePeriod',
]);

const onlineChecks = (units: Unit[]) =>
  GraphqlClienAPI.inputFieldNames([
    'CreateOrUpdateLambdaInput',
    'FissionEnvironmentInputType',
  ]).pipe(
    map(([lambdaFields, envFields]) =>
      units.flatMap((u) =>
        (
          [
            ['function', lambdaFields],
            ['environment', envFields],
          ] as const
        ).flatMap(([section, fields]) =>
          Object.keys(u.own[section] ?? {})
            .filter((k) => !fields.includes(k) && !GCLI_ONLY.has(k))
            .map(
              (k): Finding => ({
                unit: unitKey(u),
                path: `${section}.${k}`,
                level: 'warning',
                message: 'the platform API does not take this key',
              }),
            ),
        ),
      ),
    ),
  );

export const findingsFor = (units: Unit[]): Finding[] => [
  ...units
    .filter((u) => u.error)
    .map(
      (u): Finding => ({
        unit: unitKey(u),
        path: '(file)',
        level: 'error',
        message: u.error,
      }),
    ),
  ...units.filter((u) => !u.error).flatMap((u) => check(unitKey(u), u.own)),
  ...crossChecks(units),
];

export const report = (units: Unit[], findings: Finding[]) => {
  for (const u of units) {
    const mine = findings.filter((f) => f.unit === unitKey(u));
    const label = u.inheritsFrom ? ` (environment from ${u.inheritsFrom})` : '';
    Logger.info(
      `${mine.some((f) => f.level === 'error') ? 'x' : mine.length ? '!' : 'v'} ${unitKey(u)}${label}`,
    );
    for (const f of mine)
      Logger[f.level === 'error' ? 'error' : 'info'](
        `    ${f.level}: ${f.path}: ${f.message}`,
      );
  }
  const errors = findings.filter((f) => f.level === 'error').length;
  Logger.info(
    `${units.length} file(s), ${errors} error(s), ${findings.length - errors} warning(s)`,
  );
  return errors;
};

/** gcli validate [path] [--online] - every lambforge.yaml of the repository. */
export default (path: string | undefined, cmd: { online?: boolean }) =>
  lastValueFrom(
    of(discover(repoRoot(path ?? process.cwd()))).pipe(
      switchMap((units) =>
        (cmd.online
          ? onlineChecks(units).pipe(
              catchError((e) => {
                Logger.error(`--online skipped: ${(e as Error)?.message ?? e}`);
                return of([] as Finding[]);
              }),
            )
          : of([] as Finding[])
        ).pipe(
          map((online) => {
            const offline = findingsFor(units);
            const seen = new Set(offline.map((f) => `${f.unit} ${f.path}`));
            // the schema already named it - one finding per key
            const extra = online.filter(
              (f) => !seen.has(`${f.unit} ${f.path}`),
            );
            return { units, findings: [...offline, ...extra] };
          }),
        ),
      ),
      tap(({ units, findings }) => {
        if (!units.length) Logger.info('No lambforge.yaml found.');
        if (report(units, findings)) process.exitCode = 1;
      }),
    ),
  );
