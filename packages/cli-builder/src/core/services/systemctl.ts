import { Injectable } from '@rxdi/core';
import { exec } from 'child_process';
import { writeFile } from 'fs';
import { promisify } from 'util';

import { Environment } from '../../app.constants';
const defaultRunnerName = 'runner';
@Injectable()
export class SystemctlService {
  async init() {
    const service = Environment.GRAPHQL_SYSTEM_SERVICE_NAME;
    const service_description =
      Environment.GRAPHQL_SYSTEM_SERVICE_DESCRIPTION;
    const executableBinary =
      Environment.GRAPHQL_SYSTEM_SERVICE_EXECUTABLE;

    try {
      await this.install(
        service_description,
        service,
        executableBinary
      );
    } catch (e) {}
    try {
      await this.reload();
    } catch (e) {}
    try {
      await this.enable(service);
    } catch (e) {}
    try {
      await this.stop(service);
    } catch (e) {}
    try {
      await this.start(service);
    } catch (e) {}
  }

  async enable(name: string) {
    await promisify(exec)(`systemctl enable ${name}`);
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
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
    `;
  }

  async install(
    description = 'Graphql Runner',
    name = defaultRunnerName,
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
  async start(name = defaultRunnerName) {
    const data = await promisify(exec)(
      `systemctl start ${name}`
    );
    console.log(data);
  }

  async restart() {
    await this.stop();
    await this.reload();
    await this.start();
  }
  async stop(name = defaultRunnerName) {
    const data = await promisify(exec)(
      `systemctl stop ${name}`
    );
    console.log(data);
  }
  async status(name = defaultRunnerName) {
    const data = await promisify(exec)(
      `systemctl status ${name}`
    );
    console.log(data);
  }
}
