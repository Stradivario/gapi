# GCLI - The LambForge Platform CLI

`gcli` is the command-line interface for managing the LambForge platform ecosystem. It provides developers with a unified toolset for infrastructure management, serverless function deployment, AI context integration (MCP), and project configuration.

Whether you are deploying scalable serverless functions, managing cloud environments, or integrating AI capabilities into your workflow, `gcli` is your central control plane.

## Table of Contents

- [Installation](#installation)
- [Authentication](#authentication)
- [Managing Infrastructure](#managing-infrastructure)
- [Serverless Functions (Lambdas)](#serverless-functions-lambdas)
- [AI Integration (Model Context Protocol)](#ai-integration-model-context-protocol)
- [Build System](#build-system)
- [Command Reference](#command-reference)

## Installation

You can install `gcli` using a pre-built binary or via NPM.

### Binary Installation (Linux)

For a standalone installation without Node.js dependencies:

```bash
curl -L "https://github.com/Stradivario/gapi/releases/download/v1.8.198/gcli-linux" -o ~/.local/bin/gcli
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

options:
  bundler:
    watch: ['src']
    outfile: 'index.js'
    bundle: true
    minify: false
    target: node24
    external: []
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
`https://<host>/<projectId>/<route>/mcp`.

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

- **Update**: `gcli lambda:update --name 'my-function' --file ./new-index.ts`
- **Delete**: `gcli lambda:delete --name 'my-function'`
- **Get Details**: `gcli lambda:get --name 'my-function'`

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
