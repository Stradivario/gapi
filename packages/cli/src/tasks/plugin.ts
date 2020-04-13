import { Service } from '@rxdi/core';
import { exists, readFile, writeFile } from 'fs';
import { sync } from 'rimraf';
import { promisify } from 'util';

import { includes, nextOrDefault } from '../core/helpers/index';
import { IpfsHashMapService } from '../daemon-server/core/services/ipfs-hash-map.service';
import {
  GAPI_DAEMON_IPFS_PLUGINS_FOLDER,
  IPFS_HASHED_MODULES
} from '../daemon-server/daemon.config';
@Service()
export class PluginTask {
  constructor(private ipfsHashMapService: IpfsHashMapService) {}

  async run() {
    if (includes('remove')) {
      return await this.remove(nextOrDefault('remove', false));
    }
    if (includes('add')) {
      return await this.add(nextOrDefault('add', false));
    }
  }

  async add(hash: string) {
    if (!hash) {
      throw new Error('Missing ipfs hash');
    }
    this.validateHash(hash);
    const hashes = await this.readFile();
    const exist = hashes.filter(h => h === hash);
    if (exist.length) {
      console.error(`Plugin already exist ${hash}`);
      return;
    }
    await this.writeHashesToFile([...hashes, hash]);
    console.log(`Plugin installed ${hash}`);
  }

  private validateHash(hash: string) {
    if (!hash || hash.length !== 46) {
      throw new Error(`This is not correct ipfs hash ${hash}`);
    }
  }

  async remove(hash: string) {
    this.validateHash(hash);
    await this.ipfsHashMapService.readHashMap();
    const ipfsModule = this.ipfsHashMapService.find(hash);
    if (ipfsModule) {
      sync(`${GAPI_DAEMON_IPFS_PLUGINS_FOLDER}/${ipfsModule.module.namespace}`);
      this.ipfsHashMapService.remove(hash);
      await this.ipfsHashMapService.writeHashMapToFile();
      await this.writeHashesToFile(
        (await this.readFile()).filter(h => h !== hash)
      );
    }
  }

  private async readFile() {
    let hashes: string[] = [];
    if (await promisify(exists)(IPFS_HASHED_MODULES)) {
      hashes = JSON.parse(
        await promisify(readFile)(IPFS_HASHED_MODULES, { encoding: 'utf8' })
      );
    } else {
      await promisify(writeFile)(
        IPFS_HASHED_MODULES,
        JSON.stringify([], null, 4),
        { encoding: 'utf8' }
      );
    }
    return hashes;
  }

  private async writeHashesToFile(hashes: string[]) {
    await promisify(writeFile)(
      IPFS_HASHED_MODULES,
      JSON.stringify(hashes, null, 4),
      { encoding: 'utf8' }
    );
  }
}
