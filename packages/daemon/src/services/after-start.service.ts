import { AfterStarterService, Injectable } from '@rxdi/core';

import { DaemonService } from './daemon.service';

@Injectable()
export class AfterStart {
  constructor(
    private afterStarterService: AfterStarterService,
    private daemonService: DaemonService
  ) {
    this.afterStarterService.appStarted.subscribe(() =>
      this.daemonService.notifyDaemon()
    );
  }
}
