import { InjectionToken } from '@rxdi/core';

export const FedarationReplacer = (v: string) => v;
export const GRAPHQL_FEDERATION_REPLACER = new InjectionToken<
  typeof FedarationReplacer
>('GRAPHQL_FEDERATION_REPLACER');
