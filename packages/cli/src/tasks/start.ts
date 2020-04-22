/* eslint-disable @typescript-eslint/no-explicit-any */
import { Container, Service } from '@rxdi/core';
import { exists, existsSync } from 'fs';

import { ArgsService } from '../core/services/args.service';
import { ConfigService, MainConfig } from '../core/services/config.service';
import { EnvironmentVariableService } from '../core/services/environment.service';
import { ExecService } from '../core/services/exec.service';
import Bundler = require('parcel-bundler');
import childProcess = require('child_process');
import { HAPI_SERVER, sendRequest } from '@gapi/core';
import { Container as rxdiContainer } from '@gapi/core';
import { normalize } from 'path';
import { promisify } from 'util';

import { includes, nextOrDefault } from '../core/helpers';
import { IQuery } from '../daemon-server/api-introspection';

@Service()
export class StartTask {
  private argsService = Container.get(ArgsService);
  private configService: ConfigService = Container.get(ConfigService);
  private environmentService: EnvironmentVariableService = Container.get(
    EnvironmentVariableService
  );
  private execService: ExecService = Container.get(ExecService);
  private config: string;
  private configOriginal: string | MainConfig;
  private verbose = '';
  private quiet = true;

  async run(stop: { state?: boolean } = {}) {
    if (this.argsService.args.includes('--verbose')) {
      this.verbose = ' --verbose';
      this.quiet = false;
    }
    this.configService.config.config.app =
      this.configService.config.config.app || ({} as any);
    if (this.argsService.args[3] && this.argsService.args[3].includes('--')) {
      const currentConfigKey = this.argsService.args[3].replace('--', '');
      const currentConfiguration = this.configService.config.config.app[
        currentConfigKey
      ];
      if (
        currentConfiguration &&
        currentConfiguration.prototype &&
        currentConfiguration.prototype === String &&
        currentConfiguration.includes('extends')
      ) {
        this.config = this.environmentService.setVariables(
          this.extendConfig(currentConfiguration)
        );
        this.configOriginal = this.extendConfig(currentConfiguration);
        console.log(`'${currentConfigKey}' configuration loaded!`);
      } else if (currentConfiguration) {
        this.config = this.environmentService.setVariables(
          currentConfiguration
        );
        this.configOriginal = currentConfiguration;
      } else {
        this.config = this.environmentService.setVariables(
          this.configService.config.config.app.local
        );
        this.configOriginal = this.configService.config.config.app.local;
      }
      console.log(`'${currentConfigKey}' configuration loaded!`);
    } else {
      const currentConfiguration = this.configService.config.config.app
        .local as any;
      if (
        currentConfiguration &&
        currentConfiguration.prototype &&
        currentConfiguration.prototype === String &&
        currentConfiguration.includes('extends')
      ) {
        this.config = this.environmentService.setVariables(
          this.extendConfig(currentConfiguration)
        );
        this.configOriginal = this.extendConfig(currentConfiguration);
      } else {
        this.config = this.environmentService.setVariables(
          this.configService.config.config.app.local
        );
        this.configOriginal = this.configService.config.config.app.local;
      }
      console.log(`'local' configuration loaded!`);
    }
    const sleep = process.argv[5] ? `${process.argv[5]} &&` : '';
    const cwd = process.cwd();
    const htmlFile = existsSync(`${cwd}/src/index.html`);
    const customPath = process.argv[4]
      ? process.argv[4].split('--path=')[1]
      : null;
    const customPathExists = await promisify(exists)(`${cwd}/${customPath}`);
    const isLintEnabled = this.argsService.args.toString().includes('--lint');
    if (this.argsService.args.toString().includes('--docker')) {
      return await this.execService.call(
        `${this.config} && pm2-docker ${cwd}/${
          customPathExists ? customPath : 'process.yml'
        } --only APP`
      );
    } else if (this.argsService.args.toString().includes('--pm2')) {
      if (!stop.state) {
        return await this.execService.call(
          `${this.config} && pm2 stop ${cwd}/${
            customPathExists ? customPath : 'process.yml'
          }`
        );
      } else {
        return await this.execService.call(
          `${this.config} && pm2 start ${cwd}/${
            customPathExists ? customPath : 'process.yml'
          } --only APP`
        );
      }
    }
    if (process.env.DEPLOY_PLATFORM === 'heroku') {
      if (customPathExists) {
        return await this.execService.call(
          `${sleep} ts-node ${cwd}/${
            customPathExists ? customPath : 'index.ts'
          }`
        );
      } else {
        return await this.execService.call(
          `${sleep} ts-node ${cwd}/src/main.ts`
        );
      }
    } else if (process.argv.toString().includes('--ts-node')) {
      return await this.execService.call(
        `nodemon --watch '${cwd}/src/**/*.ts' ${
          this.quiet ? '--quiet' : ''
        }  --ignore '${
          this.configService.config.config.schema.introspectionOutputFolder
        }/' --ignore '${cwd}/src/**/*.spec.ts' --exec '${this.config} && ${
          isLintEnabled ? 'npm run lint &&' : ''
        } ${sleep} ts-node' ${
          customPathExists
            ? `${cwd}/${customPathExists ? customPath : 'index.ts'}`
            : `${cwd}/src/main.ts`
        }  ${this.verbose}`
      );
    } else {
      if (htmlFile) {
      }
      let files: string[] | string;

      if (customPathExists) {
        files = `${cwd}/${customPathExists ? customPath : 'index.ts'}`;
      } else if (htmlFile) {
        process.argv.push('--target=browser');
        process.argv.push('--bundle-modules');
        process.argv.push('--hmr true');
        files = `${cwd}/src/index.html`;
      } else {
        files = `${cwd}/src/main.ts`;
      }
      return await this.prepareBundler(
        files,
        {
          original: this.configOriginal,
          schema: this.configService.config.config.schema,
        },
        true,
        false
      );
    }
  }
  async isDaemonRunning() {
    this.setFakeHapiServer();
    let res = {} as any;
    try {
      res = await sendRequest<IQuery>({
        query: `
                    query {
                        status {
                            status
                        }
                    }
                `,
      });
    } catch (e) {}
    if (res.status === 200 && res.data.status.status === '200') {
      return true;
    }
    return false;
  }

  private setFakeHapiServer() {
    rxdiContainer.set(HAPI_SERVER, { info: { port: '42000' } });
  }

  async notifyDaemon(variables: { repoPath?: string }) {
    this.setFakeHapiServer();
    await sendRequest({
      query: `
            mutation notifyDaemon($repoPath: String!) {
              notifyDaemon(repoPath: $repoPath) {
                repoPath
              }
            }
            `,
      variables,
    });
  }

  async prepareBundler(
    file,
    { original, schema },
    start = includes('--start'),
    buildOnly: boolean = includes('--buildOnly=false') ? false : true,
    minify: boolean = includes('--minify=false') ? false : true,
    target: 'browser' | 'node' = includes('--target=browser')
      ? 'browser'
      : 'node',
    excludedFolders: string[] = []
  ) {
    console.log(file);
    if (schema.excludedFolders.length) {
      excludedFolders = [...excludedFolders, ...schema.excludedFolders];
    }
    if (schema.introspectionOutputFolder) {
      excludedFolders.push(schema.introspectionOutputFolder);
    }
    excludedFolders = excludedFolders.map((f) =>
      normalize(process.cwd() + f).replace('.', '')
    );
    const bundler = new Bundler(file, {
      target,
      outDir: nextOrDefault('--outDir', './dist'),
      minify,
      outFile: nextOrDefault('--outFile', null),
      // contentHash: true,
      // detailedReport: true,
      hmr: nextOrDefault('--hmr', false, (v) => Boolean(v)),
      publicUrl: nextOrDefault('--public-url', '/'),
      bundleNodeModules: includes('--bundle-modules'),
    });
    const originalOnChange = bundler.onChange.bind(bundler);
    bundler.onChange = function (path: string) {
      if (
        excludedFolders.filter((d) =>
          path.substring(0, path.lastIndexOf('/')).includes(d)
        ).length &&
        !includes('--disable-excluded-folders')
      ) {
        return;
      }
      return originalOnChange(path);
    };

    let bundle = null;
    let child = null;
    // let isFirstTimeRun = true;
    const killChild = () => {
      child.stdout.removeAllListeners('data');
      child.stderr.removeAllListeners('data');
      child.removeAllListeners('exit');
      child.kill();
    };
    bundler.on('buildStart', async () => {
      if (child) {
        killChild();
      }
    });
    bundler.on('bundled', (compiledBundle) => (bundle = compiledBundle));
    bundler.on('buildEnd', async () => {
      if (buildOnly) {
        process.stdout.write(`Gapi Application build finished! ${file}\n`);
        process.stdout.write(`Bundle source: ${bundle.name}`);
        process.exit(0);
      }
      //   const isDaemonInRunningcondition = await this.isDaemonRunning();
      //   if (!isFirstTimeRun && isDaemonInRunningcondition) {
      //     try {
      //       await this.notifyDaemon({ repoPath: process.cwd() });
      //     } catch (e) {}
      //   }

      if (start && bundle !== null) {
        if (child) {
          killChild();
        }
        if (includes('--lint')) {
          let hasError = false;
          try {
            await this.execService.call('npm run lint');
          } catch (e) {
            hasError = true;
          }
          if (hasError) {
            return;
          }
        } else {
          //   if (isDaemonInRunningcondition) {
          //     await this.execService.call('sleep 1');
          //   }
        }
        if (includes('--target=browser')) {
          return;
        }
        const childArguments = [];
        function defaultInspectConfig(type: '--inspect-brk' | '--inspect') {
          console.log(
            `${type}=${nextOrDefault('--ihost', '127.0.0.1')}:${nextOrDefault(
              '--iport',
              '9229'
            )}`
          );
          return `${type}=${nextOrDefault(
            '--ihost',
            '127.0.0.1'
          )}:${nextOrDefault('--iport', '9229')}`;
        }
        if (includes('--inspect-brk')) {
          childArguments.push(defaultInspectConfig('--inspect-brk'));
        } else if (includes('--inspect')) {
          childArguments.push(defaultInspectConfig('--inspect'));
        }
        process.env = Object.assign(process.env, original);

        child = childProcess.spawn('node', [...childArguments, bundle.name]);
        child.stdout.on('data', (data: Buffer) => {
          process.stdout.write(data);
          // isFirstTimeRun = false;
        });
        child.stderr.on('data', (data) => process.stdout.write(data));
        child.on('exit', (code) => {
          console.log(`Child process exited with code ${code}`);
          child = null;
        });
      }
      bundle = null;
    });
    if (includes('--target=browser') && !buildOnly) {
      await bundler.serve();
    } else {
      await bundler.bundle();
    }
  }

  extendConfig(config) {
    const splitted = config.split(' ');
    const argum = splitted[1].split('/');
    const extendedConfiguration = this.configService.config.config[argum[0]][
      argum[1]
    ];
    if (!extendedConfiguration) {
      throw new Error(`Cannot extend current configuration ${config}`);
    }
    return extendedConfiguration;
  }
}
