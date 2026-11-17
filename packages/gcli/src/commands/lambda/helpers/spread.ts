/** The spread options to send - only when set, so gcli still works
    against an API without the fields (plan 33). */
export function spreadScaleOptions(
  cmd: { spread?: string; spreadStrict?: string | boolean },
  spec?: { spread?: string | null; spreadStrict?: boolean | string | null },
) {
  const spread = cmd.spread ?? spec?.spread;
  const strict = cmd.spreadStrict ?? spec?.spreadStrict;
  if (spread != null && !['none', 'machines'].includes(String(spread))) {
    throw new Error(`--spread must be 'machines' or 'none' (got '${spread}')`);
  }
  return {
    ...(spread != null
      ? { spread: String(spread) as 'none' | 'machines' }
      : {}),
    ...(strict != null ? { spreadStrict: String(strict) === 'true' } : {}),
  };
}
