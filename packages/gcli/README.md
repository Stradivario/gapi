# GCLI - The LambForge Platform CLI

`gcli` is the command-line interface for managing the LambForge platform ecosystem. It provides developers with a unified toolset for infrastructure management, serverless function deployment, AI context integration (MCP), and project configuration.

Whether you are deploying scalable serverless functions, managing cloud environments, or integrating AI capabilities into your workflow, `gcli` is your central control plane.

## Table of Contents

- [Installation](#installation)
- [Authentication](#authentication)
- [Managing Infrastructure](#managing-infrastructure)
- [Serverless Functions (Lambdas)](#serverless-functions-lambdas)
- [AI Integration (Model Context Protocol)](#ai-integration-model-context-protocol)
  - [AI agent skill](#ai-agent-skill)
- [Local AI Models (Ollama runner)](#local-ai-models-ollama-runner)
- [Build System](#build-system)
- [Command Reference](#command-reference)

## Installation

You can install `gcli` using a pre-built binary or via NPM.

### Binary Installation (Linux)

For a standalone installation without Node.js dependencies:

```bash
curl -L "https://github.com/Stradivario/gapi/releases/latest/download/gcli-linux" -o ~/.local/bin/gcli
chmod +x ~/.local/bin/gcli
```

### NPM Installation

To install globally using NPM:

```bash
npm i -g @gapi/gcli
```

### CI/CD Integration

For automated pipelines (e.g., GitHub Actions), you can use `npx` with a long-lived token:

```yaml
# Example Step in GitHub Actions
- name: Deploy with GCLI
  run: npx gcli login --ci --token ${{ secrets.GCLI_AUTH_TOKEN }}
```

Create the token in the dashboard (Project → CI/CD) with only the permissions the pipeline needs. Every project command has a permission:

| Permission | Commands |
|---|---|
| Lambdas: read / deploy / create / delete | `lambda:get/list/log/build:log/test`, `lambda:update`, `lambda:create`, `lambda:delete` |
| Environments: read / write / delete | `environment:list/get`, `environment:create/update`, `environment:delete` |
| Schedules: read / write | `cron:list`, `cron:create/delete` |
| RabbitMQ: read / install / uninstall | `rabbitmq:list`, `rabbitmq:create`, `rabbitmq:delete` |
| Queue triggers: read / manage | `mq-trigger:list`, `mq-trigger:create/update/delete` |
| Plugins: read / install | `plugin:list/installed`, `plugin:install/uninstall` |
| Clusters: read / scale / create / tear down / kubeconfig | `cluster:list/status/health/scale-events/cost`, `cluster:scale/autoscale/multi-node/single-node/load-balancer/apply`, `cluster:create/apply`, `cluster:teardown`, `cluster:kubeconfig` |

A token can also be limited to some lambdas (lambda, schedule and queue-trigger commands). Typical tokens: *Deploy only* (`lambda:update`), or *DevOps (clusters)* for an infra repo that runs `gcli cluster:apply`. A command the token may not run fails with `ci-token-missing-scope: <operation> needs <permission>`. `runner:*` and `project:list` are personal and not available to CI tokens.

## Authentication

Before interacting with the platform, you must authenticate. You can log in using an API key or a personal access token.

```bash
# Interactive Login
gcli login

# Login with specific credentials
gcli login --token 'YOUR_GRAPHQL_TOKEN' --key 'YOUR_API_KEY' --url 'API_URL'
```

## Managing Infrastructure

`gcli` organizes resources into **Projects** and **Environments**.

### Project Context

To avoid repeating the project ID in every command, set a default project context:

```bash
# List available projects
gcli project:list

# Set the active project
gcli project:use 'my-project-id'

# Clear the active project
gcli project:clear
```

### Environments

Manage deployment targets (e.g., development, staging, production) directly from the CLI.

```bash
# List environments
gcli environment:list

# Create a new environment
gcli environment:create --name 'staging' --minCpu 100 --maxCpu 500 --minMemory 128 --maxMemory 512

# Get environment details
gcli environment:get --name 'staging'

# Target an environment at a private cluster instead of the shared one
# (omit --clusterId to use the shared cluster - the default). Immutable
# after creation.
gcli environment:create --name 'staging' --clusterId '<clusterId>'

# Resize it, or remove it
gcli environment:update --name 'staging' --maxCpu 800 --maxMemory 1024
gcli environment:delete --name 'staging'
```

### Private Clusters

A project isn't limited to the shared cluster - it can provision its own private, single-tenant Talos cluster on Hetzner (gated by your plan's entitlements). Environments, RabbitMQ brokers, and plugins can each independently target the shared cluster or any of a project's private clusters.

```bash
# Provision a cluster (runs in the background - takes several minutes)
gcli cluster:create --name 'prod' --imageId '<hcloud-image-id>' \
  --serverType 'cpx22' --location 'nbg1' --workers 2

# Same, but block until it's ready (or errors) instead of returning immediately
gcli cluster:create --spec cluster.yaml --wait

# List every cluster this project has (it may have several - dev/stage/prod)
gcli cluster:list

# Download a ready cluster's kubeconfig
gcli cluster:kubeconfig --cluster '<clusterId>' --output ./kubeconfig.yaml

# Tear one down
gcli cluster:teardown --cluster '<clusterId>' --wait
```

Scale, reshape and watch a cluster (the same operations as the dashboard's
cluster page). Changes run in the background; `--wait` blocks until the
cluster is `ready` again. `--clusterName <name>` works instead of
`--cluster <id>` everywhere.

```bash
# Health, load, autoscaling and open issues of every cluster (or one)
gcli cluster:status [--cluster '<clusterId>']
gcli cluster:health --cluster '<clusterId>'        # latest agent report, per node
gcli cluster:scale-events --cluster '<clusterId>'  # manual + autoscaler history
gcli cluster:cost                                  # month-to-date + monthly estimate

# Worker nodes (1-10, billed per node-hour) and control planes (1, 3 or 5)
gcli cluster:scale --cluster '<clusterId>' --workers 3 --wait
gcli cluster:scale:control-planes --cluster '<clusterId>' --count 3 --wait

# Topology: dedicated workers (needed for autoscaling) or back to one node
gcli cluster:multi-node --cluster '<clusterId>' --workers 2 --wait
gcli cluster:single-node --cluster '<clusterId>' --wait

# Autoscaling - only the flags you pass change
gcli cluster:autoscale --cluster '<clusterId>' --enable --min 2 --max 6
gcli cluster:autoscale --cluster '<clusterId>' --cpuUp 75 --cpuDown 25 --cooldown 20
gcli cluster:autoscale --cluster '<clusterId>' --disable

# Load balancer (billed per hour while enabled)
gcli cluster:load-balancer --cluster '<clusterId>' --enable --wait
```

#### Declarative clusters (`cluster:apply`)

Write the cluster you want in the `cluster:` section of `lambforge.yaml`
(or a standalone `cluster.yaml`) and let `cluster:apply` make it so: it
creates the cluster when it doesn't exist, then applies topology, workers,
control planes, the load balancer and autoscaling - one change at a time,
waiting for the cluster to be ready between them. Keys you leave out are
left as they are.

```yaml
cluster:
  name: prod
  # needed only to create it
  imageId: <hcloud-image-id>
  serverType: cpx22
  location: nbg1
  # desired state
  singleNode: false        # true = one node runs everything (cheapest, dev/stage)
  workers: 3               # 1-10; only the initial size while autoscale is enabled
  controlPlanes: 1         # 1, 3 or 5
  loadBalancer: true
  autoscale:
    enabled: true          # needs singleNode: false
    minWorkers: 2
    maxWorkers: 6
    cpuScaleUpPercent: 70  # scale up above this (of allocatable)
    memScaleUpPercent: 70
    cpuScaleDownPercent: 30
    memScaleDownPercent: 30
    samplesToScale: 3      # consecutive readings before acting
    cooldownMinutes: 15
```

```bash
gcli cluster:apply --dry-run     # print the plan, change nothing
gcli cluster:apply               # apply it
gcli cluster:apply --yes         # also steps that remove capacity or the LB IP
gcli cluster:apply --spec cluster.yaml
```

Steps that remove capacity or release the load balancer's IP (going back to
`singleNode: true`, `loadBalancer: false`) are skipped unless you pass
`--yes`. Nodes and the load balancer are billed per started hour.

### RabbitMQ Brokers

A project may have several RabbitMQ brokers, each optionally scoped to one of its private clusters.

```bash
# Provision a broker on the shared cluster
gcli rabbitmq:create --spec rabbitmq.yaml

# Provision a broker on a private cluster instead
gcli rabbitmq:create --spec rabbitmq.yaml --cluster '<clusterId>'

gcli rabbitmq:list
gcli rabbitmq:delete --id '<brokerId>'
```

`rabbitmq.yaml`:

```yaml
name: events-broker
description: Async event bus for order processing
user: admin
password: <secret>
region: EU_CENTRAL
storage:
  enabled: true
  size: SMALL
```

### Message-Queue Triggers

A trigger runs a lambda for every message on a RabbitMQ queue (and can publish the response and failures to other queues).

```bash
gcli mq-trigger:create --name orders --lambda order-handler \
  --request-topic orders --response-topic orders-done --error-topic orders-failed \
  --broker '<brokerId>'            # see rabbitmq:list; needed when brokers share queue names
gcli mq-trigger:update --name orders --max-replicas 5 --threshold 20   # only the flags you pass change
gcli mq-trigger:list
gcli mq-trigger:delete --name orders
```

Scaling flags: `--max-retries`, `--cool-down-period`, `--polling-interval`, `--min-replicas`, `--max-replicas`, `--threshold` (messages per replica).

### Marketplace Plugins

Plugins (Redis, MongoDB, NATS, FalkorDB, ...) can be installed on the shared cluster or on any private cluster - the same plugin can be installed on several clusters at once.

```bash
gcli plugin:list                                  # browse the catalog
gcli plugin:install --name 'redis-plugin'          # installs on the shared cluster
gcli plugin:install --name 'redis-plugin' --cluster '<clusterId>'
gcli plugin:installed                              # what's installed, and where
gcli plugin:uninstall --name 'redis-plugin' --cluster '<clusterId>'
```

## Serverless Functions (Lambdas)

The core of the platform is its serverless compute capability. `gcli` streamlines the entire lifecycle of a lambda function.

### Creating a Function

You can create a function from a local file, a specification, or inline code.

```bash
# Create from local source files (Recommended)
gcli lambda:create --name 'my-function' \
  --route '/api/v1/my-function' \
  --file ./index.ts \
  --package ./package.json

# Create with inline code (Quick testing)
gcli lambda:create --name 'quick-test' \
  --route '/test' \
  --code 'export default async (ctx) => ({ status: 200, body: "Hello World" })'
```

### Spec-Based Deployment (YAML & JSON)

For reproducible deployments, you can use `spec.yaml` (recommended) or `spec.json`.

**Recommended: `spec.yaml`**

```yaml
name: eye-processor
route: eye-processor
file: ./src/main.ts
script: build.sh
package: package.json
params: []
config: ''
secrets: ['gemini-credentials']
env: nodejs
network: ['public']
method: ['POST', 'OPTIONS']
uploadAsZip: true
scaleOptions:
  minCpu: 30
  maxCpu: 500
  minMemory: 32
  maxMemory: 192
  minScale: 1
  maxScale: 3
  targetCpu: 80
  executorType: newdeploy
  idleTimeout: 120
  concurrency: 1
  functionTimeout: 60
  specializationTimeout: 120
```

Deploy using:

```bash
gcli lambda:create --spec spec.yaml
```

### Unified Configuration (`lambforge.yaml`)

The modern way to manage platform capabilities is via `lambforge.yaml`. This file allows you to define the function, environment, and bundler options in a single place.

```yaml
function:
  name: eye-processor
  route: eye-processor
  file: ./src/main.ts
  script: build.sh
  package: package.json
  params: []
  config: ''
  secrets: ['gemini-credentials']
  env: nodejs
  network: ['public']
  method: ['POST', 'OPTIONS']
  uploadAsZip: true
  scaleOptions:
    minCpu: 30
    maxCpu: 500
    minMemory: 32
    maxMemory: 192
    minScale: 1
    maxScale: 3
    targetCpu: 80
    executorType: newdeploy
    idleTimeout: 120
    concurrency: 1
    functionTimeout: 60
    specializationTimeout: 120

environment:
  name: nodejs
  image: rxdi/fission-node:0.0.14
  builder: rxdi/fission-node-builder:1.0.5
  poolSize: 0
  minCpu: 0
  maxCpu: 0
  minMemory: 0
  maxMemory: 0
  region: EU_BALKANS
  clusterId: '' # omit/empty for the shared cluster; see cluster:list

options:
  bundler:
    watch: ['src']
    outfile: 'index.js'
    bundle: true
    minify: false
    target: node24
    external: []
```

The same file can also carry `cluster:`, `rabbitmq:`, `plugin:` and `triggers:` sections, read by `cluster:apply` / `cluster:create`, `rabbitmq:create`, `plugin:install` and `cron:create` respectively (each also accepts its own dedicated `--spec` file, e.g. `cluster.yaml`, if you'd rather keep them separate):

```yaml
cluster:          # every key: see "Declarative clusters" above
  name: prod
  imageId: <hcloud-image-id>
  serverType: cpx22
  location: nbg1
  workers: 2
  loadBalancer: false
  autoscale:
    enabled: true
    minWorkers: 2
    maxWorkers: 5

triggers:
  time:
    triggerName: nightly
    cron: '0 2 * * *'   # cron syntax or @every 5m / @daily

rabbitmq:
  name: events-broker
  user: admin
  password: <secret>
  region: EU_CENTRAL
  storage:
    enabled: true
    size: SMALL
  clusterId: '' # targets whichever cluster this project's cluster:create produced

plugin:
  name: redis-plugin
  clusterId: ''
```

### MCP Server Functions

A function can be provisioned as an **MCP Server** in front of a **federation graph** by setting `mcp: true`. The MCP lambda has **no source code** — it is fully described by config: the selected `mcpGraph` (a federation lambda in the same project) is resolved to its internal router URL and **introspected** (single source of truth, no schema file), and the curated `mcpOperations` become MCP tools. Use the MCP runtime image and `newdeploy` + `minScale: 1` (MCP holds long-lived streamable-HTTP sessions).

```yaml
function:
  name: my-mcp
  route: mcp
  method: ['GET', 'POST'] # streamable HTTP needs both
  network: ['public']
  env: nodejs-graphql-mcp # the MCP runtime image

  mcp: true
  mcpGraph: my-federation-gateway # an existing federation lambda in this project

  # Curated operations exposed as MCP tools. The tool name is the OPERATION name (must be named);
  # optional — the introspection/search/execute tools work without any.
  mcpOperations:
    - query: |
        query GetUser($id: ID!) { user(id: $id) { id name email } }

  # Static headers sent on EVERY upstream request (e.g. a fixed API key / service token).
  mcpHeaders:
    - name: X-Api-Key
      value: replace-me

  # Extra request headers forwarded from the caller (Authorization is ALWAYS forwarded).
  mcpForwardHeaders:
    - name: X-Tenant-Id

  scaleOptions:
    executorType: newdeploy
    minScale: 1
    maxScale: 4
    targetCpu: 70

environment:
  name: nodejs-graphql-mcp
  image: rxdi/fission-nodejs-graphql-mcp:0.0.2
  builder: rxdi/fission-node-builder:1.0.8
  poolSize: 0
  region: EU_CENTRAL
```

```bash
gcli lambda:create --project <projectId> --spec ./lambforge.yaml
```

`--mcp` and `--mcpGraph <name>` are also available as CLI flags; the array fields
(`mcpOperations`, `mcpHeaders`, `mcpForwardHeaders`) are spec-only. A full annotated example lives in
[`example/mcp/lambforge.yaml`](./example/mcp/lambforge.yaml). Client connects at
`https://<host>/<projectId>/<route>` (with `route: mcp`: `https://<host>/<projectId>/mcp`).

### Conditional Configuration (Environment-Aware Specs)

A single spec can describe **many deploy variants** without duplicating the file. The bundler/loader understands a small set of conditional tags that are resolved at load time from external environment variables, plus native YAML references (`&anchor` / `*alias`) and merge keys (`<<`) for de-duplication.

This is how you ship the **same code to two different targets** — e.g. the legacy Docker servers (where everything must be bundled) and the new [lambforge.com](https://www.lambforge.com) platform (where the `@gapi/core` framework is preinstalled in the environment image, so it must stay _external_ to avoid double-bundling).

#### Supported tags

| Tag       | Form                                       | Resolves to                                                       |
| --------- | ------------------------------------------ | ----------------------------------------------------------------- |
| `!env`    | `!env VAR`                                 | `process.env.VAR` (or `null` when unset)                          |
| `!env`    | `!env [VAR, default]`                      | `process.env.VAR ?? default`                                      |
| `!switch` | `!switch { var, default, cases }`          | `cases[process.env[var] ?? default]`                              |
| `!if`     | `!if { when, then, else }`                 | `then` when `when` is truthy, else `else`                         |
| `!if`     | `!if { var, equals, default, then, else }` | `then` when `process.env[var] ?? default === equals`, else `else` |

Notes:

- `!switch` requires a `var`. When the selected value has no matching case it falls back to `cases[default]`, otherwise `null`.
- `!if` truthiness treats `null`, `false`, `''`, `"false"` and `"0"` as **falsy**.
- Tags work **anywhere** in the file (any field — `external`, `scaleOptions`, `image`, `network`, …), and may be nested (e.g. an `!env` inside an `!if`).
- Specs that use **no** tags keep parsing exactly as before.

#### Recipes

##### 1. One file, two deploys (the flagship use case)

Select the bundler externals at build/deploy time. The new lambforge.com platform ships the framework preinstalled (keep it external), while the legacy Docker image ships nothing (bundle everything).

```yaml
# Framework packages shipped preinstalled by the lambforge.com env image.
# Declared once as an anchor and reused below.
.frameworkExternals: &frameworkExternals
  - '@gapi/core'
  - '@rxdi/core'
  - 'graphql'
  - 'rxjs'
  - 'reflect-metadata'
  # ...the rest of the preinstalled packages

options:
  bundler:
    bundle: true
    target: node24
    outfile: 'index.js'
    external: !switch
      var: LAMBFORGE_TARGET
      default: lambforge # unset => new platform => keep framework external
      cases:
        lambforge: *frameworkExternals
        docker: [] # legacy servers => nothing preinstalled => bundle everything
```

```bash
# New lambforge.com platform (default) — framework stays external, slim bundle
gcli lambda:create

# Legacy Docker servers — bundle every dependency
LAMBFORGE_TARGET=docker gcli lambda:create
```

##### 2. Per-stage autoscaling (anchors + merge keys for DRY)

Define a base block once, then override only what changes per stage. Branches that are YAML literals keep their type (numbers stay numbers).

```yaml
# Shared baseline, declared once.
.baseScale: &baseScale
  minCpu: 30
  maxCpu: 500
  minMemory: 128
  maxMemory: 1024
  targetCpu: 80
  executorType: newdeploy
  concurrency: 1000
  functionTimeout: 120

function:
  name: graphql-server-lambdas
  scaleOptions:
    <<: *baseScale # merge in the shared baseline…
    # …and override per environment
    minScale:
      !switch {
        var: DEPLOY_ENV,
        default: dev,
        cases: { prod: 2, staging: 1, dev: 0 },
      }
    maxScale:
      !switch {
        var: DEPLOY_ENV,
        default: dev,
        cases: { prod: 10, staging: 4, dev: 2 },
      }
```

##### 3. Region / image / builder selection (strings with sane defaults)

```yaml
environment:
  name: nodejs-graphql-lambdas
  # `!env [VAR, default]` — falls back to the default when the var is unset.
  image: !env [ENV_IMAGE, 'rxdi/fission-nodejs-graphql-lambdas:0.0.4']
  builder: !env [ENV_BUILDER, 'rxdi/fission-node-builder:1.0.8']
  region: !switch
    var: REGION
    default: eu
    cases:
      eu: EU_CENTRAL
      us: US_EAST
```

##### 4. Network visibility & secrets per stage

```yaml
function:
  # Public only in dev; private everywhere else.
  network: !switch
    var: DEPLOY_ENV
    default: prod
    cases:
      dev: ['public']
      staging: ['private']
      prod: ['private']
  # Swap the mounted secret set per stage.
  secrets: !switch
    var: DEPLOY_ENV
    default: prod
    cases:
      dev: ['environment-dev']
      prod: ['environment']
```

##### 5. Build toggles (minify only in production)

```yaml
options:
  bundler:
    target: !env [BUILD_TARGET, node24]
    # `!if { var, equals }` returns real booleans.
    minify: !if { var: NODE_ENV, equals: production, then: true, else: false }
    bundle: !if { var: NO_BUNDLE, equals: 'true', then: false, else: true }
```

##### 6. Feature flags with `!if` truthiness

`!if { when }` branches on the truthiness of a value. `!env DEBUG` resolves to `null` when unset and to the string when set; `null`, `''`, `"false"` and `"0"` are treated as falsy.

```yaml
options:
  bundler:
    # Ship sourcemaps-style verbose build only when DEBUG is set to a truthy value.
    minify: !if { when: !env DEBUG, then: false, else: true }
```

##### 7. Nested conditionals

Tags compose — a `!switch` branch can itself be an `!if`, an `!env`, or another `!switch`.

```yaml
environment:
  region: !switch
    var: DEPLOY_ENV
    default: dev
    cases:
      # In prod, pick the region from REGION; everywhere else stay in EU.
      prod: !if { var: REGION, equals: us, then: US_EAST, else: EU_CENTRAL }
      dev: EU_CENTRAL
```

##### 8. Putting it together — a multi-stage spec

```yaml
.frameworkExternals: &frameworkExternals
  - '@gapi/core'
  - 'rxjs'
  - 'graphql'
  - 'reflect-metadata'

.baseScale: &baseScale
  minCpu: 30
  maxCpu: 500
  minMemory: 128
  maxMemory: 1024

function:
  name: graphql-server-lambdas
  route: graphql-server-lambdas
  file: ./src/main.ts
  network:
    !switch {
      var: DEPLOY_ENV,
      default: prod,
      cases: { dev: ['public'], prod: ['private'] },
    }
  scaleOptions:
    <<: *baseScale
    minScale:
      !switch { var: DEPLOY_ENV, default: dev, cases: { prod: 2, dev: 0 } }
    maxScale:
      !switch { var: DEPLOY_ENV, default: dev, cases: { prod: 10, dev: 2 } }

options:
  bundler:
    target: node24
    minify: !if { var: DEPLOY_ENV, equals: prod, then: true, else: false }
    external: !switch
      var: LAMBFORGE_TARGET
      default: lambforge
      cases:
        lambforge: *frameworkExternals
        docker: []
```

```bash
# Production deploy to the new platform
DEPLOY_ENV=prod gcli lambda:update

# Dev deploy, still bundling everything for a local Docker run
DEPLOY_ENV=dev LAMBFORGE_TARGET=docker gcli lambda:create
```

#### Setting the variables

The tags read from `process.env` at the moment `gcli` loads the spec (i.e. at build/deploy time), so set them however that process is launched:

```bash
# Inline for a single command
LAMBFORGE_TARGET=docker gcli build

# Exported for a whole shell session / script
export DEPLOY_ENV=prod
gcli lambda:update
```

```yaml
# GitHub Actions — per step or job
- run: npx gcli lambda:update
  env:
    DEPLOY_ENV: prod
    # LAMBFORGE_TARGET left unset => defaults to the new platform
```

```dockerfile
# Dockerfile — bake the legacy target into the image build
ENV LAMBFORGE_TARGET=docker
RUN npm run build:es   # gcli build runs here and reads the value
```

#### Types & gotchas

- **`!env` is always a string.** `process.env` values are strings, so `!env [PORT, 8080]` yields the number `8080` when unset but the string `"3000"` when `PORT=3000`. For numeric/boolean fields prefer `!switch`/`!if` with YAML literal branches (e.g. `cases: { prod: 10, dev: 2 }`) — those preserve real numbers and booleans.
- **`!if { equals }` compares as strings**, so `equals: 'true'` matches the string `"true"`.
- **`!switch` requires `var`** and falls back to `cases[default]` (then `null`) when the resolved value has no case.
- **Define anchors before use.** `&anchor` must appear earlier in the file than the `*alias` that references it. A common convention is a leading `.`-prefixed key (e.g. `.frameworkExternals:`), which consumers ignore.
- **Custom tags require the `gcli` loader.** Other YAML tooling that reads the file with a vanilla parser will error on `!switch` / `!if` / `!env` (`unknown mapping tag`). The CLI itself always understands them.

### Configuration Auto-Discovery (Zero-Argument Commands)

`gcli` is designed to be context-aware. If a configuration file (`lambforge.yaml`, `spec.yaml`, or `env.yaml`) is present in your current directory, you can run commands without arguments.

The CLI will automatically read the configuration and apply it to the current project context.

```bash
# If lambforge.yaml or spec.yaml exists:
gcli lambda:create
gcli lambda:update

# If lambforge.yaml or env.yaml exists:
gcli environment:create
gcli environment:update
```

### Function Lifecycle

- **List**: `gcli lambda:list` (`--clusterName <name>` for one cluster's lambdas)
- **Update**: `gcli lambda:update --name 'my-function' --file ./new-index.ts`
- **Delete**: `gcli lambda:delete --name 'my-function'`
- **Get Details**: `gcli lambda:get --name 'my-function'`

### Schedules (cron)

One time trigger per lambda. The platform calls the lambda's root with a
GET and an `X-Fission-Timer-Name` header.

```bash
gcli cron:create --lambdaName 'my-function' --triggerName nightly --cron '0 2 * * *'
gcli cron:create                 # reads triggers.time (and function.name) from lambforge.yaml
gcli cron:list
gcli cron:delete --lambdaName 'my-function'
```

### Monitoring & Testing

Debug your functions directly from the terminal.

```bash
# Stream execution logs
gcli lambda:log --name 'my-function'

# View build logs
gcli lambda:build:log --name 'my-function'

# Invoke the function (Test)
gcli lambda:test --name 'my-function' --queryParams '?id=123' --body '{"action": "process"}'
```

## AI Integration (Model Context Protocol)

`gcli` implements the **Model Context Protocol (MCP)**, allowing AI coding assistants (like Claude or IDE extensions) to interact with your platform's context.

### Starting the MCP Server

```bash
gcli mcp:start --url "http://localhost:8000/mcp"
```

### Configuration for AI Tools

To use this with Claude Desktop or other MCP-compatible tools, add the following to your configuration file:

**For Node.js Users:**

```json
{
  "mcpServers": {
    "lambforge": {
      "command": "gcli",
      "args": ["mcp:start", "--url", "http://localhost:8000/mcp"]
    }
  }
}
```

**For Specific Node Versions:**

```json
{
  "mcpServers": {
    "lambforge": {
      "command": "/path/to/node",
      "args": [
        "/path/to/gcli",
        "mcp:start",
        "--url",
        "http://localhost:8000/mcp"
      ]
    }
  }
}
```

**For logged in users with selected current project**

```json
{
  "mcpServers": {
    "lambforge": {
      "command": "gcli",
      "args": ["mcp:start"]
    }
  }
}
```

### AI agent skill

Give a coding agent (Claude Code and other agents that read skills) the
whole platform. Paste this into the agent:

```text
Install the Lambforge skill from https://lambforge.com/skills/platform.md and follow its setup.
```

Or by hand for Claude Code:

```bash
mkdir -p ~/.claude/skills/lambforge && cd ~/.claude/skills/lambforge
for f in $(curl -fsSL https://lambforge.com/skills/files.txt); do
  curl -fsSLO "https://lambforge.com/skills/$f"
done
cp platform.md SKILL.md
claude mcp add --scope user lambforge -- gcli mcp:start
```

`platform.md` covers setup (install gcli, the login command you run from
Profile -> CLI - the agent never handles your token, `gcli mcp:start`) and
the rules, and indexes topic files the agent reads on demand: gcli, MCP
tools, deploy, REST code and testing, GraphQL and federation, websites,
MCP servers, secrets, cron and queues, clusters and plugins, operations and
costs, memory and plans. Source: gql-fission `src/skills/`.

## Local AI Models (Ollama runner)

Use models running on your own machine in the Lambforge chat - including
agent mode, spawned workers and MCP tools - exactly like the hosted models.
`gcli runner:start` connects your local [Ollama](https://ollama.com) to
Lambforge over an **outbound** WebSocket: it works behind NAT, nothing is
port-forwarded, and Ollama is never exposed to the internet. The platform
can only send chat completions to it (`POST /v1/chat/completions`).

```bash
# 1. Ollama with a model, and a context window big enough for agent mode
ollama pull qwen3:32b
OLLAMA_CONTEXT_LENGTH=32768 ollama serve

# 2. Logged-in gcli registers this machine as a runner and connects
gcli login
gcli runner:start                      # --name my-gpu-box (default: hostname)
```

Your models now appear in the chat model picker with a **Local** badge
(greyed out as **Offline** when the runner isn't running). The runner keeps
running until Ctrl+C and reconnects on its own.

| Command | Description |
|---|---|
| `gcli runner:start` | Connect this machine. First run registers a runner and saves it to `~/.graphql-server/runner.json`. Options: `--name`, `--token <runner token>` (headless machines without `gcli login` - create the token in Profile -> Local AI runners), `--ollama <url>` (default `$OLLAMA_HOST` or `http://127.0.0.1:11434`), `--wsUrl` (override the derived endpoint), `--reset` (forget the saved runner, register a new one) |
| `gcli runner:list` | Your runners: online status, last seen, models |
| `gcli runner:models` | List which models are shown in the chat; `--show a,b` shows only those, `--all` shows every model, `--none` hides them all; `--id` picks a runner (default: this machine's) |
| `gcli runner:delete` | Delete a runner and revoke its token (`--id`, default: this machine's) |
| `gcli runner:start:daemon` / `runner:daemon:install` | Install + start the runner as a systemd user service (Linux); `runner:daemon:start`, `:stop`, `:restart`, `:status`, `:logs`, `:uninstall` manage it |

### Run it in the background (systemd, Linux)

```bash
npm i -g @gapi/gcli                 # a stable install - not the npx cache
gcli login
gcli runner:start:daemon            # = runner:daemon:install; same options as runner:start
gcli runner:daemon:status
gcli runner:daemon:stop             # stop it (stays installed, starts at next login)
gcli runner:daemon:start            # start it again; tells you if it does not stay up
gcli runner:daemon:restart          # e.g. after `gcli login` to another server
gcli runner:daemon:logs             # follow the log (Ctrl+C to stop following)
gcli runner:daemon:uninstall        # stop + remove the service (runner stays registered)
```

It installs a systemd **user** service (`~/.config/systemd/user/lambforge-runner.service`,
no `sudo`) that starts with your session and restarts on failure. The runner
token stays in `~/.graphql-server/runner.json`, never in the unit file; a
revoked token stops the service instead of restart-looping. To keep it
running after logout and start it at boot, enable lingering once:
`sudo loginctl enable-linger $USER`. Preview the unit with `--dry-run`;
`--service <name>` installs several runners side by side.

Notes:

- Models are only offered if Ollama reports them as chat-capable; a model
  without the `tools` capability is used without platform tools.
- Local models don't count against your plan's AI token quota.
- Requires Node.js >= 22.
- Use Profile -> Local AI runners in the web app to see runners, choose
  models with checkboxes, and create tokens.

## Local Workspaces (the chat works in your own project)

`gcli workspace:start` connects the **current directory** to the Lambforge
chat: the AI agents can read and edit its files, run commands (`npm install`,
`npm test`, `git diff`, `tsc`) and keep dev servers running (`npm start`) -
on your machine, in your real (git) project. Same **outbound** WebSocket as
the Ollama runner: works behind NAT, opens no port. Web workspaces keep
working as before; this is an additional, local kind.

```bash
gcli login
gcli project:use <projectId>           # the workspace belongs to one project
cd ~/code/my-app
gcli workspace:start                   # --allow "npm test,npm run *" to skip approvals for those
```

Then, in a chat of that project (mode Auto): "run the tests in my local
project and fix what fails", "start the dev server and check it boots". The
agents only touch files under that directory.

**Commands need your approval** - in this terminal (`[y]es / [a]lways for
this session / [N]o`) or on the card in the chat; whichever you answer first
wins. Read-only commands (`git status/diff/log/show`, `ls`, `pwd`, ...) and
your `--allow` rules run unasked. Destructive ones (`git push`, `git reset
--hard`, `git clean`, `git commit`, `rm -r`, `sudo`, `curl ... | sh`, ...)
always ask. `--yolo` runs everything unasked - only for a sandbox or a repo
you can reset. Nobody answers in 5 minutes = denied.

| Command | Description |
|---|---|
| `gcli workspace:start` | Connect this directory. First run registers it (saved in `~/.graphql-server/workspaces.json`, per directory). Options: `--name`, `--project <id>` (default: `gcli project:use`), `--allow <list>` (comma-separated, `*` wildcard), `--no-default-allow`, `--yolo`, `--no-terminal-approval` (approve only in the chat), `--env A,B` (pass these variables to commands), `--inherit-env` (pass your whole environment), `--allow-secrets` (let the chat read `.env`/keys), `--token`, `--wsUrl`, `--reset` |
| `gcli workspace:list` | Your local workspaces: online, project, directory, running processes (`--project`) |
| `gcli workspace:delete` | Remove a workspace and revoke its token (`--id`, default: this directory's). Nothing on disk is deleted |

What the chat can and can't do:

- Files: only under the directory (symlinks resolved); `.git` is read-only;
  `.env*`, private keys, `.npmrc`, ... are invisible unless `--allow-secrets`;
  `node_modules` and `.gitignore`d files are not listed or searched.
- Commands run as you, in a minimal environment (PATH, HOME, nvm/pnpm
  dirs - none of your shell's tokens) unless `--env` / `--inherit-env`.
- Background processes (`npm start`) live until the chat stops them or you
  stop gcli - Ctrl+C stops every one of them.
- Every operation is printed here (`->` read, `✎` write, `$` command,
  `▶` process), so you can watch what the agent does.
- Review with `git diff` and commit yourself - the agents are told not to
  commit, push or reset.

Requires Node.js >= 22.

## Build System & Local Development

`gcli` includes a high-performance bundler powered by **esbuild**.

```bash
# Build a project
gcli build --files src/index.ts --outfile dist/bundle.js --minify

# Start in watch mode (defaults to watching the bundled file)
gcli start --files src/index.ts
```

When using with `lambforge.yaml`

```bash
# Build a project
gcli build

# Start includes build and spawns `node bundled-file.js` it uses `function.file` in `lambforge.yaml` config
gcli start
```

### Advanced Watch Options

By default, `gcli start` watches only the entry file passed to the bundle. To watch specific directories or configure advanced options, use the `lambforge.yaml` file:

```yaml
options:
  bundler:
    watch: ['src', 'lib']
    outfile: 'index.js'
    bundle: true
    minify: false
    target: node24
    external: []
```

---

## Command Reference

For a complete list of commands and options, use the built-in help:

```bash
gcli --help
gcli lambda:create --help
```

## Running in WebContainer using wasm

Install `esbuild-wasm` dependency inside your package.json if the project will be running in WebContainer

```bash
npm install esbuild-wasm
```
