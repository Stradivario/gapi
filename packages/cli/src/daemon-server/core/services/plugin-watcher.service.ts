import { Injectable } from '@rxdi/core';
import { watch } from 'chokidar';
import { Observable } from 'rxjs';

import {
  GAPI_DAEMON_HTTP_PLUGINS_FOLDER,
  GAPI_DAEMON_IPFS_PLUGINS_FOLDER,
  GAPI_DAEMON_PLUGINS_FOLDER,
  IPFS_HASHED_MODULES
} from '../../daemon.config';
import { ChildService } from './child.service';

@Injectable()
export class PluginWatcherService {
  constructor(private childService: ChildService) {}

  private isNotFromExternalPlugins(path: string) {
    return !path.includes('ipfs-plugins');
  }

  watch() {
    return new Observable<string[]>(observer => {
      const initPlugins: string[] = [];
      let isInitFinished = false;
      const watcher = watch(
        [
          `${GAPI_DAEMON_IPFS_PLUGINS_FOLDER}/**/*.js`,
          `${GAPI_DAEMON_HTTP_PLUGINS_FOLDER}/**/*.js`,
          `${GAPI_DAEMON_PLUGINS_FOLDER}/**/*.js`,
          IPFS_HASHED_MODULES
        ],
        {
          ignored: /^\./,
          persistent: true
        }
      );
      watcher
        .on('add', (path: string) => {
          if (!isInitFinished && this.isNotFromExternalPlugins(path)) {
            console.log('Plugin', path, 'has been added');
            initPlugins.push(path);
          } else {
            console.log('Present external module', path);
          }
          if (isInitFinished && this.isNotFromExternalPlugins(path)) {
            this.restartDaemon();
          }
        })
        .on('change', (path: string) => {
          console.log('File', path, 'has been changed');
          if (isInitFinished) {
            this.restartDaemon();
          }
        })
        .on('ready', () => {
          console.log('Initial scan complete. Ready for changes');
          observer.next(initPlugins);
          observer.complete();
          isInitFinished = true;
        })
        .on('unlink', path => {
          console.log('File', path, 'has been removed');
          if (isInitFinished) {
            this.restartDaemon();
          }
        })
        .on('error', error => console.error('Error happened', error));
    });
  }

  private async restartDaemon() {
    await this.childService.spawn('gapi', ['daemon', 'restart'], process.cwd());
    process.exit();
  }
}
