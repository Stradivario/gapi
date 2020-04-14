import { Injector, Service } from '@rxdi/core';

import { includes, nextOrDefault } from '../../core/helpers/index';
import { ConfigService } from '../../core/services/config.service';
import { SchematicRunner } from './runners/schematic.runner';

@Service()
export class GenerateTask {
  @Injector(ConfigService) private configService: ConfigService;

  getPlatform() {
    return this.configService.config.config.schematics.platform;
  }

  isServer() {
    return this.getPlatform() === 'server';
  }

  isClient() {
    return this.getPlatform() === 'client';
  }

  async run() {
    let dryRun = includes('--dry-run');
    const force = includes('--force');
    let internalArguments = '';
    const args = process.argv.slice(3);
    let method = '';
    const sourceRoot = nextOrDefault('--source-root', 'src/app');
    const language = nextOrDefault('--language', 'ts');
    let schematicsName = nextOrDefault('--schematics-name', '@gapi/schematics');
    const schematicsConfig = this.configService.getSchematicsConfig();
    if (schematicsConfig.name) {
      schematicsName = schematicsConfig.name;
    }
    if (schematicsConfig.dryRun) {
      dryRun = true;
    }

    let hasSpec = false;
    if (args[0] === 'c' || args[0] === 'controller') {
      method = 'controller';
      hasSpec = true;
    }
    if (args[0] === '-c' || args[0] === 'component') {
      method = 'component';
      hasSpec = true;
    }
    if (args[0] === 's' || args[0] === 'service') {
      method = 'service';
      hasSpec = true;
    }

    if (args[0] === 'm' || args[0] === 'module') {
      method = 'module';
    }

    if (args[0] === 't' || args[0] === 'type') {
      method = 'type';
    }

    if (args[0] === 'p' || args[0] === 'provider') {
      method = 'provider';
    }

    if (args[0] === 's' || args[0] === 'service') {
      method = 'service';
    }

    if (args[0] === 'g' || args[0] === 'guard') {
      method = 'guard';
    }

    if (args[0] === 'i' || args[0] === 'interceptor') {
      method = 'interceptor';
    }
    if (args[0] === 'e' || args[0] === 'effect') {
      method = 'effect';
    }

    if (args[0] === 'e' || args[0] === 'effect') {
      method = 'effect';
    }

    if (args[0] === 'pg' || args[0] === 'plugin') {
      method = 'plugin';
      internalArguments = `--method=${nextOrDefault('--method', 'GET')}`;
    }
    if (!method) {
      throw new Error('Method not specified');
    }
    try {
      await new SchematicRunner().run(
        `${schematicsName}:${method} --name=${
          args[1]
        } --force=${force} --dryRun=${dryRun} ${
          schematicsConfig.hasSpec || hasSpec ? '--spec' : ''
        } --language='${language}' --sourceRoot='${sourceRoot}' ${internalArguments}`
      );
    } catch (e) {
      console.log(e);
    }
  }
}
