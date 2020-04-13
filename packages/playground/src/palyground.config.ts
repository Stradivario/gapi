import { InjectionToken } from '@rxdi/core';
import { RenderPageOptions } from 'graphql-playground-html';

export interface PlaygroundConfig extends RenderPageOptions {
  path?: string;
  endpoint?: string;
  graphiqlPlayground?: boolean;
}

export const PLAYGROUND_CONFIG = new InjectionToken(
  'gapi-playground-config-token'
);
