import { Module } from '@rxdi/core';

import { ChildService } from './services/child.service';
import { DaemonService } from './services/daemon.service';
import { IpfsHashMapService } from './services/ipfs-hash-map.service';
import { ListService } from './services/list.service';

@Module({
  services: [ListService, DaemonService, ChildService, IpfsHashMapService]
})
export class CoreModule {}
