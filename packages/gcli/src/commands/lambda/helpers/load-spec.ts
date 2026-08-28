import {
  ICreateTimeTriggerInput,
  IFissionEnvironmentInputType,
  IHttpMethodsEnum,
  ILambdaScaleInputOptions,
  IMcpForwardHeaderInput,
  IMcpHeaderInput,
  IMcpOperationInput,
  IRabbitMqStorageSizeEnum,
} from '@introspection/index';
import { combineLatest, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { readFileAsObservable } from './read-file';
import { loadYaml } from './yaml-schema';

interface ConfigJSON {
  name: string;
  route: string;
  file: string;
  env: string;
  method?: IHttpMethodsEnum[];
  script?: string;
  package?: string;
  params?: string[];
  configs?: string[];
  secrets?: string[];
  envSecrets?: string[];
  network?: string[];
  uploadAsZip?: string;
  federation?: boolean;
  subgraphs?: string[];
  /* MCP server (from lambforge.yaml `function.mcp*`) */
  mcp?: boolean;
  mcpGraph?: string;
  mcpOperations?: IMcpOperationInput[];
  mcpHeaders?: IMcpHeaderInput[];
  mcpForwardHeaders?: IMcpForwardHeaderInput[];
  cache?: boolean;
  scaleOptions?: ILambdaScaleInputOptions;
}

interface BundlerOptions {
  bundler: {
    watch: string[];
    ignore: string[];
    outfile: string;
    bundle: boolean;
    minify: boolean;
    target: boolean;
    external: string[];
  };
}

/** Provisions a private Talos cluster - see `cluster:create`. */
interface ClusterConfig {
  name: string;
  imageId: string;
  serverType: string;
  location: string;
  workers?: number;
  singleNode?: boolean;
}

/** Provisions a RabbitMQ broker - see `rabbitmq:create`. A project may have
    several; `clusterId` targets a private cluster, omitted = shared. */
interface RabbitMqConfig {
  name: string;
  description?: string;
  user: string;
  password: string;
  region: string;
  storage?: { enabled: boolean; size?: IRabbitMqStorageSizeEnum };
  clusterId?: string;
}

/** Installs a marketplace plugin - see `plugin:install`. `clusterId` targets
    a private cluster, omitted = shared; a project may install the same
    plugin on several clusters at once. */
interface PluginConfig {
  name: string;
  clusterId?: string;
  config?: Record<string, unknown>;
}

interface LambForgeConfig extends ConfigJSON {
  function: ConfigJSON;
  environment: IFissionEnvironmentInputType;
  triggers: {
    time: ICreateTimeTriggerInput;
  };
  options: BundlerOptions;
  cluster: ClusterConfig;
  rabbitmq: RabbitMqConfig;
  plugin: PluginConfig;
}

export const loadSpec = <T = LambForgeConfig>(spec?: string) =>
  combineLatest([
    readFileAsObservable(spec).pipe(
      map((spec) => JSON.parse(spec)),
      catchError(() =>
        from(readFileAsObservable(spec)).pipe(
          map((file) => loadYaml(file)),
          catchError(() => of(false)),
        ),
      ),
    ),
    readFileAsObservable('lambforge.yaml').pipe(
      map((data) => loadYaml(data)),
      catchError(() => of(false)),
    ),
    readFileAsObservable('spec.json').pipe(
      map((spec) => JSON.parse(spec)),
      catchError(() => of(false)),
    ),
    readFileAsObservable('spec.yaml').pipe(
      map((data) => loadYaml(data)),
      catchError(() => of(false)),
    ),
  ]).pipe(
    map(
      ([custom, lambforge, json, yaml]) =>
        (custom || lambforge || json || yaml) as T,
    ),
  );
