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

import { ClusterDesired } from '../../cluster/helpers/plan';
import { readFileAsObservable } from './read-file';
import { loadYaml } from './yaml-schema';

interface ConfigJSON {
  name: string;
  route: string;
  file: string;
  env: string;
  /* Explicit disambiguation hint: which of the project's clusters `env`
     lives on (omit for the shared cluster) - see lambda:create's own
     --clusterId flag doc. clusterId is authoritative and wins if both are
     set; clusterName is a human-readable alternative for a more readable
     lambforge.yaml (a project's cluster names are unique too). */
  clusterId?: string;
  clusterName?: string;
  method?: IHttpMethodsEnum[];
  script?: string;
  package?: string;
  params?: string[];
  configs?: string[];
  secrets?: string[];
  envSecrets?: string[];
  /* Largest request body the lambda accepts, e.g. "20mb" (runtime default 10mb) */
  bodyLimit?: string | number;
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

/** A private Talos cluster: provisioned by `cluster:create`, reconciled to
    this desired state by `cluster:apply` (ClusterDesired). */
type ClusterConfig = ClusterDesired;

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

/** Queues declared on one of the project's RabbitMQ brokers - see
    `queue:declare`. `broker` is the broker's name or id; it may be left out
    when the project has exactly one broker. */
export interface QueuesConfig {
  broker?: string;
  declare: string[];
}

/** One message-queue trigger - see `mq-trigger:apply`. Runs `lambda`
    (default: this file's `function.name`) for every message on
    `requestTopic`; the lambda's response goes to `responseTopic`, a call
    that keeps failing to `errorTopic`. */
export interface MqTriggerConfig {
  name: string;
  lambda?: string;
  requestTopic: string;
  responseTopic?: string;
  errorTopic?: string;
  /** broker name or id; optional with one broker */
  broker?: string;
  maxRetries?: number;
  coolDownPeriod?: number;
  pollingInterval?: number;
  minReplicas?: number;
  maxReplicas?: number;
  threshold?: number;
}

/** One entry of `domains:` - see `domain:apply`. Either a platform name
    (`name: acme` -> https://acme.lambforge.app, live at once) or a custom
    domain (`host: api.example.com` - point its CNAME at the target gcli
    prints). `serves`: a lambda name (that lambda at the root, the default:
    this file's `function.name`), `all` (every lambda at /<route>) or
    `full-path` (/<projectId>/<route>, like functions.lambforge.com).
    `paths`: prefix -> lambda name, the longest prefix wins. */
export interface DomainConfig {
  name?: string;
  host?: string;
  serves?: string;
  paths?: Record<string, string>;
}

interface LambForgeConfig extends ConfigJSON {
  function: ConfigJSON;
  /* clusterName is gcli-only convenience (resolved to the real clusterId
     client-side, see resolveClusterId) - not part of the actual backend
     FissionEnvironmentInputType schema. */
  environment: IFissionEnvironmentInputType & { clusterName?: string };
  triggers: {
    time: ICreateTimeTriggerInput;
    mq?: MqTriggerConfig[];
  };
  queues: QueuesConfig;
  options: BundlerOptions;
  cluster: ClusterConfig;
  rabbitmq: RabbitMqConfig;
  plugin: PluginConfig;
  domains?: DomainConfig[];
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
