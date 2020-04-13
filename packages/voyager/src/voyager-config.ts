import { InjectionToken } from '@rxdi/core';

export class VoyagerConfigModel {
  path = '/voyager';
  endpointUrl = '/graphql';
}

export const VoyagerConfig = new InjectionToken<VoyagerConfigModel>(
  'gapi-voyager-config-injection-token'
);
