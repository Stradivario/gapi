/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CoreModuleConfig, HAPI_SERVER } from '@gapi/core';
import { Container, FileService, Service } from '@rxdi/core';
import { spawn } from 'child_process';
import { exists, openSync, readFile, writeFile } from 'fs';
import * as rimraf from 'rimraf';
import { promisify } from 'util';
import { load } from 'yamljs';

import { includes, nextOrDefault } from '../core/helpers';
import { getProcessList } from '../core/helpers/ps-list';
import { strEnum } from '../core/helpers/stringEnum';
import { GapiConfig } from '../core/services/config.service';
import { DaemonExecutorService } from '../core/services/daemon-executor/daemon-executor.service';
import { ILinkListType } from '../daemon-server/api-introspection/index';
import {
  GAPI_DAEMON_FOLDER,
  GAPI_DAEMON_HTTP_PLUGINS_FOLDER,
  GAPI_DAEMON_IPFS_PLUGINS_FOLDER,
  GAPI_DAEMON_PLUGINS_FOLDER,
  GAPI_DAEMON_PROCESS_LIST_FOLDER,
} from '../daemon-server/daemon.config';
import { BootstrapTask } from './bootstrap';

export const DaemonTasks = strEnum([
  'start',
  'stop',
  'clean',
  'kill',
  'bootstrap',
  'link',
  'unlink',
  'list',
  'restart',
  'status',
]);
export type DaemonTasks = keyof typeof DaemonTasks;

@Service()
export class DaemonTask {
  private outLogFile = `${GAPI_DAEMON_FOLDER}/out.log`;
  private errLogFile = `${GAPI_DAEMON_FOLDER}/err.log`;
  private pidLogFile = `${GAPI_DAEMON_FOLDER}/pid`;
  private bootstrapTask: BootstrapTask = Container.get(BootstrapTask);
  // private systemDService: SystemDService = Container.get(SystemDService);
  private daemonExecutorService: DaemonExecutorService = Container.get(
    DaemonExecutorService
  );
  constructor(private fileService: FileService) {}
  private async makeSystemFolders() {
    await this.fileService.mkdirp(GAPI_DAEMON_FOLDER).toPromise();
    await this.fileService.mkdirp(GAPI_DAEMON_IPFS_PLUGINS_FOLDER).toPromise();
    await this.fileService.mkdirp(GAPI_DAEMON_HTTP_PLUGINS_FOLDER).toPromise();
    await this.fileService.mkdirp(GAPI_DAEMON_PLUGINS_FOLDER).toPromise();
  }
  private start = async (name?: string) => {
    await this.killDaemon();
    await this.makeSystemFolders();
    // if (includes('--systemd')) {
    //   await this.systemDService.register({
    //     name: name || 'my-node-service',
    //     cwd: __dirname.replace('tasks', 'core/helpers/'),
    //     app: __dirname.replace('tasks', 'core/helpers/systemd-daemon.js'),
    //     engine: 'node',
    //     env: {}
    //   });
    // } else {
    const child = spawn('gapi', ['daemon', 'bootstrap'], {
      detached: true,
      stdio: [
        'ignore',
        openSync(this.outLogFile, 'a'),
        openSync(this.errLogFile, 'a'),
      ],
    });
    await promisify(writeFile)(this.pidLogFile, child.pid, {
      encoding: 'utf-8',
    });
    console.log('DAEMON STARTED!', `\nPID: ${child.pid}`);
    child.unref();
    // }
  };

  private restart = async (name: string) => {
    await this.stop();
    await this.start();
  };

  private stop = async (name?: string) => {
    // if (includes('--systemd')) {
    //   await this.systemDService.remove(name || 'my-node-service');
    // } else {
    await this.killDaemon();
    // }
  };

  private list = async () => {
    const linkList = await this.daemonExecutorService.getLinkList();

    const chalk = require('chalk');
    [...new Set(linkList.data.getLinkList.map((l) => l.linkName))].forEach(
      (l) => {
        const list = linkList.data.getLinkList.filter((i) => i.linkName === l);
        console.log(
          chalk.green(
            `\n--- Link name: '${l}' --- \n--- Linked projects ${list.length} ---`
          )
        );
        list.forEach((i, index) =>
          console.log(
            `\n${chalk.blue(
              `(${index + 1})(${l})${
                i.serverMetadata.port
                  ? `(Main Graph with port ${i.serverMetadata.port})`
                  : ''
              }`
            )} \n  Path: ${chalk.yellow(i.repoPath)}`,
            `\n  Introspection folder: ${chalk.yellow(i.introspectionPath)}`
          )
        );
      }
    );
  };

  private kill = (pid: number) => process.kill(Number(pid));
  private status = async () => {
    console.log(
      `Daemon status: ${(await this.isDaemonRunning()) ? 'active' : 'stopped'}`
    );
  };

  private link = async (linkName = 'default') => {
    const encoding = 'utf-8';
    let config: GapiConfig = { config: { schema: {} } } as any;
    const processList: ILinkListType[] = await this.getProcessList();
    config = await this.readGapiConfig();
    config.config = config.config || ({} as any);
    config.config.schema = config.config.schema || ({} as any);
    const introspectionPath =
      config.config.schema.introspectionOutputFolder || `./api-introspection`;
    linkName = config.config.schema.linkName || linkName;
    const currentRepoProcess = {
      repoPath: process.cwd(),
      introspectionPath,
      linkName,
      serverMetadata: {} as any,
    };
    await promisify(writeFile)(
      GAPI_DAEMON_PROCESS_LIST_FOLDER,
      JSON.stringify(
        processList
          .filter((p) => p.repoPath !== process.cwd())
          .concat(currentRepoProcess)
      ),
      { encoding }
    );
    console.log(
      `Project linked ${process.cwd()} link name: ${
        currentRepoProcess.linkName
      }`
    );
  };

  private async readGapiConfig() {
    let file: GapiConfig = {} as any;
    try {
      file = load(process.cwd() + '/gapi-cli.conf.yml');
    } catch (e) {}
    return file;
  }

  private async isDirectoryAvailable(linkName: string) {
    const encoding = 'utf-8';
    let isDirectoryAvailable: boolean;
    try {
      isDirectoryAvailable = await promisify(exists)(linkName);
    } catch (e) {}
    if (isDirectoryAvailable) {
      const processList: ILinkListType[] = await this.getProcessList();
      const [currentProcess] = processList.filter(
        (p) => p.repoPath === linkName
      );
      await promisify(writeFile)(
        GAPI_DAEMON_PROCESS_LIST_FOLDER,
        JSON.stringify(processList.filter((p) => p.repoPath !== linkName)),
        {
          encoding,
        }
      );
      console.log(
        `Project unlinked ${linkName} link name: ${currentProcess.linkName}`
      );
      return true;
    } else {
      return false;
    }
  }

  private async getProcessList() {
    let processList: ILinkListType[] = [];
    try {
      processList = JSON.parse(
        await promisify(readFile)(GAPI_DAEMON_PROCESS_LIST_FOLDER, {
          encoding: 'utf8',
        })
      );
    } catch (e) {}
    return processList;
  }

  private unlink = async () => {
    const processList: ILinkListType[] = await this.getProcessList();
    const encoding = 'utf-8';

    const linkName = nextOrDefault('unlink', null, (t) =>
      t !== '--all' ? t : null
    );
    if (await this.isDirectoryAvailable(linkName)) {
      return;
    }
    const [currentProcess] = processList.filter(
      (p) => p.repoPath === process.cwd()
    );
    if (linkName) {
      await promisify(writeFile)(
        GAPI_DAEMON_PROCESS_LIST_FOLDER,
        JSON.stringify(processList.filter((p) => p.linkName !== linkName)),
        {
          encoding,
        }
      );
    } else if (includes('--all') && processList.length) {
      await promisify(writeFile)(
        GAPI_DAEMON_PROCESS_LIST_FOLDER,
        JSON.stringify([]),
        {
          encoding,
        }
      );
    } else if (currentProcess) {
      await promisify(writeFile)(
        GAPI_DAEMON_PROCESS_LIST_FOLDER,
        JSON.stringify(processList.filter((p) => p.repoPath !== process.cwd())),
        { encoding }
      );
    } else if (includes('--link-name') && processList.length) {
      const linkName = nextOrDefault('--link-name');
      await promisify(writeFile)(
        GAPI_DAEMON_PROCESS_LIST_FOLDER,
        JSON.stringify(processList.filter((p) => p.linkName !== linkName)),
        { encoding }
      );
    }
    if (currentProcess) {
      if (linkName) {
        const unlinkedProcesses = processList.filter(
          (p) => p.linkName === linkName
        );
        console.log(
          `Projects unlinked ${JSON.stringify(
            unlinkedProcesses,
            null,
            2
          )} link name: ${currentProcess.linkName}`
        );
      } else {
        console.log(
          `Project unlinked ${process.cwd()} link name: ${
            currentProcess.linkName
          }`
        );
      }
    }
  };

  private clean = async () => {
    const isRunning = await this.isDaemonRunning();
    if (!isRunning) {
      await promisify(rimraf)(GAPI_DAEMON_FOLDER);
    } else {
      console.log(
        'Cannot perform clean operation while daemon is running execute `gapi daemon stop` and try again'
      );
    }
    console.log(`${GAPI_DAEMON_FOLDER} cleaned!`);
  };

  private genericRunner = (task: DaemonTasks) => (args) =>
    (this[task] as any)(args || nextOrDefault(task, ''));

  private tasks: Map<
    DaemonTasks | string,
    (args?: any) => Promise<void>
  > = new Map([
    [DaemonTasks.start, this.genericRunner(DaemonTasks.start)],
    [DaemonTasks.stop, this.genericRunner(DaemonTasks.stop)],
    [DaemonTasks.clean, this.genericRunner(DaemonTasks.clean)],
    [DaemonTasks.kill, this.genericRunner(DaemonTasks.kill)],
    [DaemonTasks.bootstrap, this.genericRunner(DaemonTasks.bootstrap)],
    [DaemonTasks.link, this.genericRunner(DaemonTasks.link)],
    [DaemonTasks.unlink, this.genericRunner(DaemonTasks.unlink)],
    [DaemonTasks.list, this.genericRunner(DaemonTasks.list)],
    [DaemonTasks.status, this.genericRunner(DaemonTasks.status)],
  ]);

  bootstrap = async (options: CoreModuleConfig) => {
    return await this.bootstrapTask.run(options);
  };

  async run() {
    if (includes(DaemonTasks.clean)) {
      console.log(`Cleaning daemon garbage inside ${GAPI_DAEMON_FOLDER}!`);
      return await this.tasks.get(DaemonTasks.clean)();
    }
    if (includes(DaemonTasks.start)) {
      console.log(`Stating daemon! Garbage is inside ${GAPI_DAEMON_FOLDER}!`);
      return await this.tasks.get(DaemonTasks.start)();
    }
    if (includes(DaemonTasks.restart)) {
      return await this.tasks.get(DaemonTasks.restart)();
    }
    if (includes(DaemonTasks.status)) {
      return await this.tasks.get(DaemonTasks.status)();
    }
    if (includes(DaemonTasks.stop)) {
      console.log(`Stopping daemon! Garbage is inside ${GAPI_DAEMON_FOLDER}!`);
      return await this.tasks.get(DaemonTasks.stop)();
    }
    if (includes(DaemonTasks.kill)) {
      return await this.tasks.get(DaemonTasks.kill)();
    }
    if (includes(DaemonTasks.unlink)) {
      return await this.tasks.get(DaemonTasks.unlink)();
    }
    if (includes(DaemonTasks.link)) {
      return await this.tasks.get(DaemonTasks.link)();
    }
    if (includes(DaemonTasks.list)) {
      Container.reset(HAPI_SERVER);

      Container.set(HAPI_SERVER, { info: { port: '42000' } });
      return await this.tasks.get(DaemonTasks.list)();
    }
    if (includes(DaemonTasks.bootstrap)) {
      return await this.tasks.get(DaemonTasks.bootstrap)({
        server: {
          hapi: {
            port: 42000,
          },
        },
        graphql: {
          openBrowser: false,
          graphiql: false,
          graphiQlPlayground: false,
        },
      } as CoreModuleConfig);
    }
    console.log('Missing command for Daemon');
  }

  private async killDaemon() {
    const pid = await this.readPidDaemonConfig();
    if (!pid) {
      console.log('Daemon is not running!');
      return;
    }
    if (await this.isDaemonRunning()) {
      console.log(`Daemon process ${pid} Killed!`);
      process.kill(pid);
    }
  }

  private async readPidDaemonConfig() {
    let pid: number;
    try {
      pid = Number(
        await promisify(readFile)(this.pidLogFile, { encoding: 'utf-8' })
      );
    } catch (e) {}
    return pid;
  }

  private async isDaemonRunning() {
    const pid = await this.readPidDaemonConfig();
    if (!pid) {
      console.log('Daemon is not running!');
      return false;
    }
    return !!(await this.getActiveDaemon(pid)).length;
  }

  private async getActiveDaemon(pid: number) {
    return (await getProcessList()).filter((p) => p.pid === pid);
  }
}
