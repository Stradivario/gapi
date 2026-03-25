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
