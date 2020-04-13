/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileService, Service } from '@rxdi/core';
import { exists, readFile, writeFile } from 'fs';
import { combineLatest, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { promisify } from 'util';

import { ILinkListType } from '../../api-introspection';
import { GAPI_DAEMON_PROCESS_LIST_FOLDER } from '../../daemon.config';
import { GAPI_CLI_CONFIG_TEMPLATE } from '../templates/gapi-cli-config.template';
import { ChildService } from './child.service';
import { ListService } from './list.service';

@Service()
export class DaemonService {
  constructor(
    private listService: ListService,
    private childService: ChildService,
    private fileService: FileService
  ) {}

  notifyDaemon(payload: ILinkListType) {
    return this.findByRepoPath(payload).pipe(
      switchMap(([mainNode]) =>
        this.saveMainNode(
          Object.assign(mainNode ? mainNode : ({} as any), {
            serverMetadata: payload.serverMetadata
          })
        )
      ),
      switchMap(mainNode => this.findLinkedRepos(mainNode)),
      switchMap(otherRepos =>
        combineLatest([
          this.trigger(payload),
          ...otherRepos.map(r =>
            this.trigger(
              Object.assign(r, { serverMetadata: payload.serverMetadata })
            )
          )
        ])
      ),
      map(() => payload)
    );
  }

  private async trigger(payload: ILinkListType): Promise<ILinkListType> {
    if (!(await promisify(exists)(payload.repoPath))) {
      await this.fileService.mkdirp(payload.repoPath).toPromise();
    }
    const gapiLocalConfig = `${payload.repoPath}/gapi-cli.conf.yml`;
    if (!(await promisify(exists)(gapiLocalConfig))) {
      await this.writeGapiCliConfig(gapiLocalConfig, payload);
    }
    const args = [
      'schema',
      'introspect',
      '--collect-documents',
      '--collect-types'
    ];
    await this.childService.spawn('gapi', args, payload.repoPath);
    return payload;
  }

  private async saveMainNode(payload: ILinkListType) {
    let processList: ILinkListType[] = [];
    const encoding = 'utf8';
    try {
      processList = JSON.parse(
        await promisify(readFile)(GAPI_DAEMON_PROCESS_LIST_FOLDER, { encoding })
      );
    } catch (e) {}
    await promisify(writeFile)(
      GAPI_DAEMON_PROCESS_LIST_FOLDER,
      JSON.stringify(
        processList.filter(p => p.repoPath !== payload.repoPath).concat(payload)
      ),
      { encoding }
    );
    return payload;
  }
  private async writeGapiCliConfig(gapiLocalConfig, payload: ILinkListType) {
    let port = 9000;
    if (payload.serverMetadata.port) {
      port = payload.serverMetadata.port;
    }
    return await promisify(writeFile)(
      gapiLocalConfig,
      GAPI_CLI_CONFIG_TEMPLATE(port)
    );
  }
  private findByRepoPath(payload: ILinkListType) {
    return from(this.listService.readList()).pipe(
      switchMap(list =>
        list.length
          ? this.listService.findByRepoPath(payload.repoPath)
          : of([] as ILinkListType[])
      )
    );
  }
  private findLinkedRepos(repo: ILinkListType) {
    return repo && repo.linkName
      ? this.listService.findByLinkName(repo.linkName).exclude(repo.repoPath)
      : of([] as ILinkListType[]);
  }
}
