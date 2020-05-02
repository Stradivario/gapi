import { Injectable } from '@rxdi/core';
import { exec } from 'child_process';
import { writeFile } from 'fs';
import { promisify } from 'util';

import { Environment } from '../../app.constants';

@Injectable()
export class SystemctlService {
  async init() {
    await this.install(
      Environment.GRAPHQL_SYSTEM_SERVICE_DESCRIPTION,
      Environment.GRAPHQL_SYSTEM_SERVICE_NAME
    );
    await this.reload();
    await this.start();
  }

  generateConfig(description = 'Graphql Runner') {
    return `
[Unit]
Description=${description}

[Service]
ExecStart=${process.cwd()}/runner-linux
${Object.entries(Environment).map(
  ([key, value]) => `${key}=${value}`
)}

[Install]
WantedBy=multi-user.target
    `;
  }

  async install(
    description = 'Graphql Runner',
    name = 'runner'
  ) {
    await promisify(
      writeFile
    )(
      `/etc/systemd/system/${name}.service`,
      this.generateConfig(description),
      { encoding: 'utf-8' }
    );
  }
  async reload() {
    const data = await promisify(exec)(
      `systemctl daemon-reload`
    );
    console.log(data);
  }
  async start(name = 'runner') {
    const data = await promisify(exec)(
      `systemctl start ${name}`
    );
    console.log(data);
  }
  async stop(name = 'runner') {
    const data = await promisify(exec)(
      `systemctl stop ${name}`
    );
    console.log(data);
  }
  async status(name = 'runner') {
    const data = await promisify(exec)(
      `systemctl status ${name}`
    );
    console.log(data);
  }
}
