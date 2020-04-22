import { Injectable } from '@rxdi/core';
import { readFile } from 'fs';
import { promisify } from 'util';

import { ILinkListType } from '../../api-introspection/index';
import { GAPI_DAEMON_PROCESS_LIST_FOLDER } from '../../daemon.config';

@Injectable()
export class ListService {
  private linkedList: ILinkListType[] = [];

  async readList() {
    try {
      this.linkedList = JSON.parse(
        await promisify(readFile)(GAPI_DAEMON_PROCESS_LIST_FOLDER, {
          encoding: 'utf-8',
        })
      );
    } catch (e) {}
    return this.linkedList;
  }

  async findByRepoPath(repoPath: string) {
    return (await this.readList()).filter((l) => l.repoPath === repoPath);
  }

  findByLinkName(linkName: string) {
    return {
      results: async () =>
        (await this.readList()).filter((l) => l.linkName === linkName),
      exclude: async (isNotLike: string) =>
        (await this.readList()).filter(
          (l) => l.linkName === linkName && l.repoPath !== isNotLike
        ),
    };
  }
}
