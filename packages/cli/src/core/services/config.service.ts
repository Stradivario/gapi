/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from '@rxdi/core';
export class MainConfig {
  API_PORT?: number | string;
  DB_PORT?: string;
  DB_HOST?: string;
  DB_USERNAME?: string;
  DB_PASSWORD?: string;
  API_CERT?: string;
  DB_NAME?: string;
  TESTS_TOKEN?: string;
  GRAPHIQL_TOKEN?: string;
  ENDPOINT_TESTING?: string;
  NODE_ENV?: string;
  GAPI_VERSION?: string;
}
export type Platforms = 'server' | 'client';
export interface SchematicsConfig {
  name: string;
  dryRun: boolean;
  hasSpec: boolean;
  platform: Platforms;
}

export interface GapiMainConfig {
  deploy: {
    app_name: string;
  };
  app: {
    local: MainConfig | string;
    prod: MainConfig | string;
  };
  test: {
    prod: MainConfig | string;
    local: MainConfig | string;
    worker: MainConfig | string;
  };
  schematics: SchematicsConfig;
  schema: {
    linkName: string;
    excludedFolders: string[];
    introspectionEndpoint: string;
    introspectionOutputFolder: string;
    headers: string;
    pattern: string;
  };
  remote: {
    link: string;
    token: string;
  };
}
export class Commands {
  commands: {
    docker: {
      start: string;
      stop: string;
      build: string;
    };
  };
  config: GapiMainConfig;
}

export class GapiConfig extends Commands {
  port: string;
}

@Service()
export class ConfigService {
  config: GapiConfig = new GapiConfig();

  setCustomConfig(config: GapiConfig) {
    Object.assign(this.config, config);
    if (!config) {
      config = {} as any;
    }
    if (!config.commands) {
      config.commands = {} as any;
    } else {
      if (config.commands['test']) {
        this.genericError('test');
      }
      if (config.commands['new']) {
        this.genericError('new');
      }
      if (config.commands['schema']) {
        this.genericError('schema');
      }
      if (config.commands['start']) {
        this.genericError('start');
      }
      if (config.commands['stop']) {
        this.genericError('stop');
      }
    }
    this.config = config;
    this.config.config = this.config.config || ({} as any);
    this.config.config.schema = Object.assign(
      {
        linkName: 'default',
        excludedFolders: [],
        introspectionEndpoint: '',
        introspectionOutputFolder: '',
        headers: '',
        pattern: '',
      },
      this.config.config.schema
    );
    this.config.config.schematics =
      this.config.config.schematics || ({} as any);
    this.config.config.app = this.config.config.app || {
      local: {
        GAPI_VERSION: '',
      },
      prod: {
        GAPI_VERSION: '',
      },
    };
  }
  getSchematicsConfig() {
    return this.config.config.schematics;
  }
  genericError(command: string) {
    throw new Error(
      `You cannot define command '${command}' they are restricted!`
    );
  }
}
