/* eslint-disable @typescript-eslint/no-explicit-any */
// const service = require('service-systemd');
import { Service } from '@rxdi/core';
import { readFileSync, writeFile } from 'fs';
import { promisify } from 'util';

import { GAPI_DAEMON_FOLDER } from '../../daemon-server/daemon.config';

interface SystemDServiceInterface {
  name: string;
  cwd: string;
  app: string;
  env?: {
    [key: string]: any;
  };
  engine: 'node' | 'forever' | 'pm2';
}

@Service()
export class SystemDService {
  private services: SystemDServiceInterface[] = this.readServicesFile();

  private readServicesFile() {
    let file: SystemDServiceInterface[] = [];
    try {
      file = JSON.parse(
        readFileSync(`${GAPI_DAEMON_FOLDER}/services`, { encoding: 'utf8' })
      );
    } catch (e) {}
    return file;
  }

  async remove() {
    // await service.remove(name);
  }

  async register(options: SystemDServiceInterface) {
    // await service.add(options);
    this.services.push(options);
    await promisify(writeFile)(
      `${GAPI_DAEMON_FOLDER}/services`,
      JSON.stringify(this.services),
      { encoding: 'utf8' }
    );
  }
}
