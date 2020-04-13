/* eslint-disable @typescript-eslint/no-var-requires */
import {
  ExternalImporter,
  ExternalModuleConfiguration,
  FileService,
  Injectable,
  Metadata
} from '@rxdi/core';
import { exists, readFileSync, writeFile } from 'fs';
import { of } from 'rxjs';
import { combineLatest, map, switchMap, take, tap } from 'rxjs/operators';
import { promisify } from 'util';

import {
  GAPI_DAEMON_HTTP_PLUGINS_FOLDER,
  GAPI_DAEMON_IPFS_PLUGINS_FOLDER,
  GAPI_DAEMON_PLUGINS_FOLDER,
  IPFS_HASHED_MODULES
} from '../../daemon.config';
import { IpfsHashMapService } from './ipfs-hash-map.service';
import { PluginWatcherService } from './plugin-watcher.service';

interface CustomMetadata extends Function {
  metadata: Metadata;
}

@Injectable()
export class PluginLoader {
  private defaultIpfsProvider = 'https://ipfs.io/ipfs/';
  private defaultDownloadFilename = 'gapi-plugin';
  private filterDups = (modules: CustomMetadata[]) =>
    [...new Set(modules.map(i => i.metadata.moduleHash))].map(
      m => this.cache[m]
    );

  cache: { [key: string]: CustomMetadata } = {};
  constructor(
    private externalImporterService: ExternalImporter,
    private fileService: FileService,
    private pluginWatcherService: PluginWatcherService,
    private ipfsHashMapService: IpfsHashMapService
  ) {}

  loadPlugins() {
    return this.makePluginsDirectories().pipe(
      switchMap(() => this.ipfsHashMapService.readHashMap()),
      switchMap(() => this.pluginWatcherService.watch()),
      // switchMap(() => this.fileService.fileWalker(pluginsFolder)),
      map(p =>
        [...new Set(p)].map(path =>
          !new RegExp(/^(.(?!.*\.js$))*$/g).test(path)
            ? this.loadModule(require(path))
            : null
        )
      ),
      switchMap(pluginModules =>
        of(null).pipe(
          combineLatest(
            [...new Set(this.loadIpfsHashes())].map(hash =>
              this.getModule(hash)
            )
          ),
          map(externalModules => externalModules.concat(pluginModules)),
          map(m => m.filter(i => !!i)),
          map((modules: CustomMetadata[]) => this.filterDups(modules)),
          tap(() => this.ipfsHashMapService.writeHashMapToFile())
        )
      )
    );
  }

  private loadIpfsHashes() {
    let hashes = [];
    try {
      hashes = JSON.parse(
        readFileSync(IPFS_HASHED_MODULES, { encoding: 'utf8' })
      );
    } catch (e) {}
    return hashes;
  }

  private getModule(hash: string, provider: string = this.defaultIpfsProvider) {
    return this.externalImporterService
      .downloadIpfsModuleConfig({
        hash,
        provider
      })
      .pipe(
        take(1),
        tap((externalModule: ExternalModuleConfiguration) => {
          const isPresent = this.ipfsHashMapService.hashMap.filter(
            h => h.hash === hash
          ).length;
          if (!isPresent) {
            this.ipfsHashMapService.hashMap.push({
              hash,
              module: {
                fileName: this.defaultDownloadFilename,
                namespace: externalModule.name,
                extension: 'js',
                outputFolder: `${GAPI_DAEMON_IPFS_PLUGINS_FOLDER}/`,
                link: `${this.defaultIpfsProvider}${externalModule.module}`
              }
            });
          }
        }),
        switchMap((externalModule: ExternalModuleConfiguration) =>
          this.externalImporterService.importModule(
            {
              fileName: this.defaultDownloadFilename,
              namespace: externalModule.name,
              extension: 'js',
              outputFolder: `${GAPI_DAEMON_IPFS_PLUGINS_FOLDER}/`,
              link: `${this.defaultIpfsProvider}${externalModule.module}`
            },
            externalModule.name,
            { folderOverride: `//` }
          )
        ),
        map((data: Function) => this.loadModule(data))
      );
  }

  private cacheModule(currentModule: CustomMetadata) {
    if (!currentModule.metadata) {
      throw new Error(
        'Missing metadata for module maybe it is not from @rxdi infrastructure ?'
      );
    }
    return (this.cache[currentModule.metadata.moduleHash] = currentModule);
  }

  private loadModule(m: Function): CustomMetadata {
    const currentModule: CustomMetadata = m[Object.keys(m)[0]];
    if (!currentModule) {
      throw new Error(`Missing cache module ${JSON.stringify(m)}`);
    }
    return this.cacheModule(currentModule);
  }

  private async makeIpfsHashFile() {
    if (!(await promisify(exists)(IPFS_HASHED_MODULES))) {
      await promisify(writeFile)(
        IPFS_HASHED_MODULES,
        JSON.stringify([], null, 4),
        { encoding: 'utf8' }
      );
    }
  }

  private makePluginsDirectories() {
    return of(true).pipe(
      switchMap(() => this.fileService.mkdirp(GAPI_DAEMON_IPFS_PLUGINS_FOLDER)),
      switchMap(() => this.fileService.mkdirp(GAPI_DAEMON_HTTP_PLUGINS_FOLDER)),
      switchMap(() => this.fileService.mkdirp(GAPI_DAEMON_PLUGINS_FOLDER)),
      switchMap(() => this.makeIpfsHashFile())
    );
  }
}
