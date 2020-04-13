import { InjectionToken } from '@rxdi/core';

import { Eth, HttpProvider, Provider, Providers, Utils } from './web3.typings';

export const Web3Token = new InjectionToken('GAPI_WEB3_TOKEN');
export const Web3ProviderToken = new InjectionToken('GAPI_WEB3_PROVIDER_TOKEN');

export interface Web3Token {
  eth: Eth;
  utils: Utils;
  providers: Providers;
  setProvider(provider: Provider): void;
}

export type Web3ProviderToken = HttpProvider;
