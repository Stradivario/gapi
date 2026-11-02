import { IFissionEnvironmentInputType } from '@introspection/index';

/** Numeric fields of FissionEnvironmentInputType (GraphQL Int). */
const NUMERIC_FIELDS = [
  'minCpu',
  'maxCpu',
  'minMemory',
  'maxMemory',
  'poolSize',
  'maxPods',
  'builderPoolSize',
  'builderMaxParallelBuilds',
  'builderIdleTimeout',
  'terminationGracePeriod',
] as const;

/** Options of environment:create/update that are not API fields. */
const CLI_ONLY = ['spec', 'project', 'clusterName'] as const;

/**
 * The environment input to send: spec values, then the flags given on the
 * command line. Commander hands every flag over as a string ("0" ->
 * `Expected type Int`) and the CLI-only options (`--spec`, `--project`)
 * used to be sent too (`Field "spec" is not defined`); both are fixed here.
 */
export const environmentPayload = (
  spec: Record<string, unknown>,
  flags: Record<string, unknown>,
): IFissionEnvironmentInputType => {
  const merged: Record<string, unknown> = { ...spec };
  for (const [key, value] of Object.entries(flags)) {
    if (value !== undefined) merged[key] = value;
  }
  for (const key of CLI_ONLY) delete merged[key];
  for (const key of NUMERIC_FIELDS) {
    const value = merged[key];
    if (value === undefined || value === null || typeof value === 'number') {
      continue;
    }
    const n = Number(value);
    if (!Number.isInteger(n)) {
      throw new Error(`--${key} must be a whole number, got "${value}"`);
    }
    merged[key] = n;
  }
  return merged as IFissionEnvironmentInputType;
};
