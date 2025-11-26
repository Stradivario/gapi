import { InjectionToken } from '@rxdi/core';
import { FalkorDB as FalkorDb } from 'falkordb';
import { FalkorDBOptions } from 'falkordb/dist/src/falkordb';

export const FalkorDBConfig = new InjectionToken('falkordb-config');
export type FalkorDBConfig = FalkorDBOptions;

export const FalkorDB = new InjectionToken('falkordb');
export type FalkorDB = FalkorDb;
