import { Container, Service } from '@rxdi/core';

import { ArgsService } from '../core/services/args.service';
import { ConfigService } from '../core/services/config.service';
import { EnvironmentVariableService } from '../core/services/environment.service';
import { ExecService } from '../core/services/exec.service';

@Service()
export class TestTask {
  private execService: ExecService = Container.get(ExecService);
  private argsService: ArgsService = Container.get(ArgsService);
  private configService: ConfigService = Container.get(ConfigService);
  private environmentService: EnvironmentVariableService = Container.get(
    EnvironmentVariableService
  );
  private args: string;
  private config = ``;
  private verbose = '';

  async run() {
    this.args = this.argsService.args.toString();
    this.setConfig();
    this.setSleep();
    if (this.args.includes('--verbose')) {
      this.verbose = ' --verbose';
    }
    console.log(this.config);
    if (this.args.includes('--before')) {
      this.config += `&& export BEFORE_HOOK=true`;
      try {
        await this.execService.call(
          `${this.config} && ts-node ${process.cwd()}/src/test.ts`
        );
      } catch (e) {
        console.error(
          `ERROR: Terminal exited with STATUS ${e} tests will not be runned check ${
            process.argv[4] ? process.argv[4] : '/src/test.ts'
          }, appropriate exit code is 0`
        );
        process.exit(1);
      }
      await this.execService.call(`${this.config} && jest`);
      console.log('SUCCESS');
    } else {
      if (this.args.includes('--watch')) {
        try {
          await this.execService.call(
            `nodemon --watch '${process.cwd()}/src/**/*.ts' --ignore '${
              this.configService.config.config.schema.introspectionOutputFolder
            }/' --exec '${this.config} && npm run lint && jest' ${this.verbose}`
          );
          // this.startTask.run();
          // await execService.call(`${this.config} && jest --watchAll`);
        } catch (e) {
          process.exit(1);
        }
      } else {
        try {
          await this.execService.call(`${this.config} && npm run lint && jest`);
        } catch (e) {
          return process.exit(1);
        }
      }
      console.log('SUCCESS');
    }
  }

  setSleep() {
    this.config += `&& sleep 0`;
  }

  setConfig() {
    if (this.argsService.args[3]) {
      const currentConfigKey = this.argsService.args[3].replace('--', '');
      const currentConfiguration = this.configService.config.config.test[
        currentConfigKey
      ];
      if (currentConfiguration) {
        this.extendOrDefault(currentConfiguration);
        console.log(`'${currentConfigKey}' configuration loaded!`);
      } else {
        if (currentConfigKey !== 'watch' && currentConfigKey !== 'before') {
          console.log(
            `Missing '${currentConfigKey}' argument configuration inside gapi-cli.conf.yml > config > test switching to 'local' configuration.`
          );
        }
        this.extendOrDefault(this.configService.config.config.test.local);
      }
    } else {
      this.extendOrDefault(this.configService.config.config.test.local);
    }
  }

  extendOrDefault(currentConfiguration) {
    if (
      currentConfiguration.constructor === String &&
      currentConfiguration.includes('extends')
    ) {
      this.config = this.environmentService.setVariables(
        this.extendConfig(currentConfiguration)
      );
    } else {
      this.config = this.environmentService.setVariables(currentConfiguration);
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
  validateConfig(key: string) {
    if (!this.configService.config.config.test[key]) {
      throw new Error('Missing test config inside gapi-cli.conf.yml');
    }
    if (!this.configService.config.config.test[key].db_host) {
      throw new Error('Missing variable db_host inside gapi-cli.conf.yml');
    }

    if (!this.configService.config.config.test[key].db_name) {
      throw new Error('Missing variable db_name inside gapi-cli.conf.yml');
    }

    if (!this.configService.config.config.test[key].db_pass) {
      throw new Error('Missing variable db_password inside gapi-cli.conf.yml');
    }

    if (!this.configService.config.config.test[key].db_port) {
      throw new Error('Missing variable db_port inside gapi-cli.conf.yml');
    }

    if (!this.configService.config.config.test[key].db_user) {
      throw new Error('Missing variable db_user inside gapi-cli.conf.yml');
    }

    if (!this.configService.config.config.test[key].endpoint) {
      throw new Error('Missing variable endpoint inside gapi-cli.conf.yml');
    }

    if (!this.configService.config.config.test[key].token) {
      throw new Error('Missing variable token inside gapi-cli.conf.yml');
    }
  }
}
