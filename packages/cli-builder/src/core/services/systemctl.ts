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
      Environment.GRAPHQL_SYSTEM_SERVICE_NAME,
      Environment.GRAPHQL_SYSTEM_SERVICE_EXECUTABLE
    );
    await this.reload();
    await this.start();
  }

  generateConfig(
    description = 'Graphql Runner',
    executable = 'runner-linux'
  ) {
    return `
[Unit]
Description=${description}

[Service]
ExecStart=${process.cwd()}/${executable}
${Object.entries(Environment)
  .filter(
    ([key, value]) =>
      ![
        'GRAPHQL_SYSTEM_SERVICE',
        'GRAPHQL_SYSTEM_SERVICE_NAME',
        'GRAPHQL_SYSTEM_SERVICE_DESCRIPTION',
      ].includes(key) && !!value
  )
  .map(([key, value]) => `Environment="${key}=${value}"`)
  .join('\n')}

[Install]
WantedBy=multi-user.target
    `;
  }

  async install(
    description = 'Graphql Runner',
    name = 'runner',
    executable = 'runner-linux'
  ) {
    await promisify(
      writeFile
    )(
      `/etc/systemd/system/${name}.service`,
      this.generateConfig(description, executable),
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
