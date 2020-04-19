import { DocumentNode, InjectionToken } from '@gapi/core';

export const CommandsToken = new InjectionToken();
export const EnumToken = new InjectionToken();
export const SubscriptionQuery = new InjectionToken<
  DocumentNode
>();

export type SubscriptionQuery = DocumentNode;
export const MachineStatusQuery = new InjectionToken<
  DocumentNode
>();

export type MachineStatusQuery = DocumentNode;
