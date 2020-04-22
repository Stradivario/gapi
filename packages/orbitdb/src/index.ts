import { Module } from '@rxdi/core';

import { OrbitDbPlugin } from './orbitdb.plugin';

@Module({
  plugins: [OrbitDbPlugin],
})
export class OrbitDbModule {}

export * from './orbitdb-injection';
export * from './orbitdb.plugin';
