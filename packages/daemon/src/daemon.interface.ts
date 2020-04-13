import { InjectionToken } from '@rxdi/core';

export const DaemonLink = new InjectionToken<string>(
  'gapi-daemon-graphql-server-link'
);
export type DaemonLink = string;
export interface DaemonConfig {
  activated: boolean;
  link?: DaemonLink;
}
