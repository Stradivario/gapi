Usage: gcli [options] [command]

Options:
  -V, --version                                        output the version number
  -h, --help                                           display help for command

Commands:
  login [options]                                      Login to graphql-server
  lambda:list [options]                                List of all lambdas for project
  lambda:get [options]                                 Get lambda by id
  lambda:create [options]
  lambda:update [options]
  lambda:delete [options]                              Get lambda by id
  lambda:log [options]                                 Get lambda log
  lambda:build:log [options]                           Get build log
  lambda:test [options]                                Test lambda
  lambda:package [options]
  project:list                                         List of all projects
  project:use <project>                                Adds default project to be used all around the CLI
  project:clear                                        Clears default project to be used all around the CLI
  build [options]                                      Build bundle using esbuild https://esbuild.github.io 
  environment:list [options]                           List of all environments for project
  environment:create [options]                         Create environment for project
  environment:update [options]                         Update environment for project
  environment:delete [options]                         Delete environment for project
  environment:get [options]                            Get environment for project
  mcp:start [options]                                  Start mcp proxy server
  start [options]                                      Start bundle using esbuild https://esbuild.github.io 
  cron:create [options]                                Create cron
  cron:delete [options]                                Delete cron
  cron:list [options]                                  List of all cron jobs for project
  cluster:create [options]                             Provision a private Talos cluster for a project (runs in the background - takes several minutes; use --wait to block)
  cluster:apply [options]                              Make a private cluster match the `cluster:` section of lambforge.yaml: creates it if missing, then applies topology, workers, control planes, load balancer and autoscaling
  cluster:list [options]                               List every private cluster this project has (it may have several - dev/stage/prod, ...)
  cluster:teardown [options]                           Tear down one of a project's clusters (runs in the background - use --wait to block)
  cluster:kubeconfig [options]                         Print (or save) a cluster's raw kubeconfig YAML - only available once it's 'ready'
  cluster:status [options]                             Every cluster's status, agent, nodes, CPU/memory load, autoscaling and open issues (or one with --cluster)
  cluster:health [options]                             The latest health report of a cluster's agent, with every node
  cluster:scale-events [options]                       Manual and autoscaler scale history, newest first
  cluster:cost [options]                               Month-to-date cost and the monthly estimate of the project's private clusters
  cluster:scale [options]                              Set the number of worker nodes (1-10) of a multi-node cluster - billed per node-hour
  cluster:scale:control-planes [options]               Set the number of control-plane nodes (1, 3 or 5)
  cluster:autoscale [options]                          Change the worker autoscaling policy - only the flags you pass change
  cluster:multi-node [options]                         Convert a single-node cluster to dedicated worker nodes (required for autoscaling)
  cluster:single-node [options]                        Convert a multi-node cluster back to a single node (removes the worker nodes)
  cluster:load-balancer [options]                      Add or remove the cluster's load balancer (billed per hour while enabled)
  rabbitmq:create [options]                            Provision a RabbitMQ broker for a project (a project may have several)
  rabbitmq:list [options]                              List every RabbitMQ broker for a project
  rabbitmq:delete [options]                            Delete a RabbitMQ broker
  plugin:list                                          List every plugin available in the marketplace catalog
  plugin:installed [options]                           List plugins installed for a project (may include the same plugin on several clusters)
  plugin:install [options]                             Install a marketplace plugin for a project
  plugin:uninstall [options]                           Uninstall a plugin from a project (--cluster picks which installation, if it's on several)
  runner:start [options]                               Connect this machine's Ollama to the Lambforge chat as a local AI runner (outbound connection only - works behind NAT, Ollama is never exposed)
  runner:daemon:install|runner:start:daemon [options]  Run the runner in the background as a systemd user service: starts with your session, restarts on failure (Linux)
  runner:daemon:status [options]                       Show the runner service status (systemctl --user status)
  runner:daemon:logs [options]                         Follow the runner service log (journalctl --user -f)
  runner:daemon:uninstall [options]                    Stop and remove the runner service (the runner stays registered)
  runner:list                                          List your local AI runners and the models they serve
  runner:models [options]                              Choose which of a runner's models appear in the chat model picker (no flags: list them)
  runner:delete [options]                              Delete a local AI runner and revoke its token
  help [command]                                       display help for command
[36m
--- Subcommand: login ---[0m
Usage: gcli login [options]

Login to graphql-server

Options:
  -k, --key <key>         Specify api key
  -uu, --uploadUrl <key>  Specify upload server
  -ci, --ci               Initialize directories for CI/CD purposes
  -t, --token <token>     Specify custom token generated from the website
  -u, --url <url>         Specify api url
  -h, --help              display help for command
[36m
--- Subcommand: lambda:list ---[0m
Usage: gcli lambda:list [options]

List of all lambdas for project

Options:
  -p, --project <project>           Specify custom token generated from the
                                    website
  -cid, --clusterId <clusterId>     Only lambdas whose environment targets this
                                    cluster (empty string for
                                    shared-cluster-only; omit for all)
  -cn, --clusterName <clusterName>  Same as --clusterId but by the cluster's
                                    human-readable name (see cluster:list) -
                                    resolved to its id before the request;
                                    --clusterId wins if both are given
  -h, --help                        display help for command
[36m
--- Subcommand: lambda:get ---[0m
Usage: gcli lambda:get [options]

Get lambda by id

Options:
  -l, --lambda <lambda>             get by lambda id
  -n, --name <name>                 get by lambda name
  -p, --project <project>           get by lambda name
  -p, --spec <spec>                 get by lambda name
  -cid, --clusterId <clusterId>     Disambiguates which lambda to fetch when
                                    --name matches more than one across
                                    different clusters
  -cn, --clusterName <clusterName>  Same as --clusterId but by the cluster's
                                    human-readable name (see cluster:list);
                                    --clusterId wins if both are given
  -h, --help                        display help for command
[36m
--- Subcommand: lambda:create ---[0m
Usage: gcli lambda:create [options]

Options:
  --name <name>                                    Function name
  --project <project>                              Project in which this lambda is defined
  --env <env>                                      Environment name for function can be NODEJS
  --clusterId <clusterId>                          Disambiguation hint: which of the project's clusters --env lives on (see cluster:list); omit for the shared cluster. Only needed once a project has private clusters and a duplicate-named environment across them.
  --clusterName <clusterName>                      Same as --clusterId but by the cluster's human-readable name (see cluster:list); --clusterId wins if both are given. Can also be set as `clusterName` in the lambforge.yaml spec's function block.
  --method <method...>                             HTTP Methods: GET,POST,PUT,DELETE,HEAD. To mention single method
  --spec <spec>                                    Spec file yml or json path
  --packageJson <packageJson>                      Define packageJson in string format
  --package <package>                              Path to package.json
  --buildBashScript <buildBashScript>              Package build command for builder to run with
  --script <script>                                Package build script path
  --params <params>                                Array from strings which defines route params
  --configs <configs...>                           List of kubernetes config names
  --secrets <secrets...>                           List of kubernetes secret names
  --envSecrets <envSecrets...>                     List of kubernetes secret names projected into process.env (graphql environment only)
  --network <network>                              Can be private or public meaning exposed to the router or just for private available can be both also --network private --network public
  --route <route>                                  Lambda route in which will be accessible
  --code <code>                                    URL or local path for single file source code
  --file <file>                                    Main lambda file
  --customUploadFileId <customUploadFileId>        Id of a pre-uploaded archive to use as the lambda source
  --federation                                     Provision this lambda as a GraphQL Federation gateway instead of a regular function
  --subgraphs <subgraphs...>                       Lambda names (within the project) to expose as subgraphs of the federation gateway
  --mcp                                            Provision this lambda as an Apollo MCP Server in front of a federation graph
  --mcpGraph <mcpGraph>                            Federation gateway lambda name the MCP server connects to (operations/headers via spec yaml)
  --executorType <executorType>                    Executor type for execution; one of 'poolmgr', 'newdeploy'
  --maxCpu <maxCpu>                                Maximum CPU to be assigned to pod (In millicore, minimum 1)
  --minCpu <minCpu>                                Minimum CPU to be assigned to pod (In millicore, minimum 1)
  --maxMemory <maxMemory>                          Maximum memory to be assigned to pod (In megabyte)
  --minMemory <minMemory>                          Minimum memory to be assigned to pod (In megabyte)
  --minScale <minScale>                            Minimum number of pods (Uses resource inputs to configure HPA)
  --maxScale <maxScale>                            Maximum number of pods (Uses resource inputs to configure HPA)
  --targetCpu <targetCpu>                          Target average CPU usage percentage across pods for scaling
  --idleTimeout <idleTimeout>                      The length of time (in seconds) that a function is idle before pod(s) are eligible for recycling
  --concurrency <concurrency>                      Maximum number of pods specialized concurrently to serve requests
  --functionTimeout <functionTimeout>              Maximum time for a request to wait for the response from the function
  --specializationTimeout <specializationTimeout>  Timeout for executor to wait for function pod creation
  -h, --help                                       display help for command
[36m
--- Subcommand: lambda:update ---[0m
Usage: gcli lambda:update [options]

Options:
  --name <name>                                    Function name
  --project <project>                              Project in which this lambda is defined
  --env <env>                                      Environment name for function can be NODEJS
  --clusterId <clusterId>                          Disambiguation hint: which of the project's clusters --env lives on (see cluster:list); omit for the shared cluster. Only needed once a project has private clusters and a duplicate-named environment across them.
  --clusterName <clusterName>                      Same as --clusterId but by the cluster's human-readable name (see cluster:list); --clusterId wins if both are given. Can also be set as `clusterName` in the lambforge.yaml spec's function block.
  --method <method...>                             HTTP Methods: GET,POST,PUT,DELETE,HEAD. To mention single method
  --spec <spec>                                    Spec file yml or json path
  --packageJson <packageJson>                      Define packageJson in string format
  --package <package>                              Path to package.json
  --buildBashScript <buildBashScript>              Package build command for builder to run with
  --script <script>                                Package build script path
  --params <params>                                Array from strings which defines route params
  --configs <configs...>                           List of kubernetes config names
  --secrets <secrets...>                           List of kubernetes secret names
  --envSecrets <envSecrets...>                     List of kubernetes secret names projected into process.env (graphql environment only)
  --network <network>                              Can be private or public meaning exposed to the router or just for private available can be both also --network private --network public
  --route <route>                                  Lambda route in which will be accessible
  --code <code>                                    URL or local path for single file source code
  --file <file>                                    Main lambda file
  --customUploadFileId <customUploadFileId>        Id of a pre-uploaded archive to use as the lambda source
  --federation                                     Provision this lambda as a GraphQL Federation gateway instead of a regular function
  --subgraphs <subgraphs...>                       Lambda names (within the project) to expose as subgraphs of the federation gateway
  --mcp                                            Provision this lambda as an Apollo MCP Server in front of a federation graph
  --mcpGraph <mcpGraph>                            Federation gateway lambda name the MCP server connects to (operations/headers via spec yaml)
  --executorType <executorType>                    Executor type for execution; one of 'poolmgr', 'newdeploy'
  --maxCpu <maxCpu>                                Maximum CPU to be assigned to pod (In millicore, minimum 1)
  --minCpu <minCpu>                                Minimum CPU to be assigned to pod (In millicore, minimum 1)
  --maxMemory <maxMemory>                          Maximum memory to be assigned to pod (In megabyte)
  --minMemory <minMemory>                          Minimum memory to be assigned to pod (In megabyte)
  --minScale <minScale>                            Minimum number of pods (Uses resource inputs to configure HPA)
  --maxScale <maxScale>                            Maximum number of pods (Uses resource inputs to configure HPA)
  --targetCpu <targetCpu>                          Target average CPU usage percentage across pods for scaling
  --idleTimeout <idleTimeout>                      The length of time (in seconds) that a function is idle before pod(s) are eligible for recycling
  --concurrency <concurrency>                      Maximum number of pods specialized concurrently to serve requests
  --functionTimeout <functionTimeout>              Maximum time for a request to wait for the response from the function
  --specializationTimeout <specializationTimeout>  Timeout for executor to wait for function pod creation
  -h, --help                                       display help for command
[36m
--- Subcommand: lambda:delete ---[0m
Usage: gcli lambda:delete [options]

Get lambda by id

Options:
  -n, --name <name>                 get by lambda name
  -p, --project <project>           get by lambda name
  -s, --spec <spec>                 get by lambda name
  -e, --env <env>                   disambiguates which lambda to delete when
                                    --name matches more than one across
                                    environments/clusters
  -cid, --clusterId <clusterId>     disambiguates which lambda to delete when
                                    --name matches more than one across
                                    different clusters
  -cn, --clusterName <clusterName>  Same as --clusterId but by the cluster's
                                    human-readable name (see cluster:list);
                                    --clusterId wins if both are given
  -h, --help                        display help for command
[36m
--- Subcommand: lambda:log ---[0m
Usage: gcli lambda:log [options]

Get lambda log

Options:
  -l, --lambda <lambda>             get by lambda id
  -n, --name <name>                 get by lambda name
  -p, --project <project>           get by lambda name
  -s, --spec <spec>                 get by lambda name
  -cid, --clusterId <clusterId>     disambiguates which lambda to fetch logs
                                    for when --name matches more than one
                                    across different clusters
  -cn, --clusterName <clusterName>  Same as --clusterId but by the cluster's
                                    human-readable name (see cluster:list);
                                    --clusterId wins if both are given
  -h, --help                        display help for command
[36m
--- Subcommand: lambda:build:log ---[0m
Usage: gcli lambda:build:log [options]

Get build log

Options:
  -l, --lambda <lambda>             get by lambda id
  -n, --name <name>                 get by lambda name
  -p, --project <project>           get by lambda project
  -s, --spec <spec>                 use configuration
  -cid, --clusterId <clusterId>     disambiguates which lambda to fetch build
                                    logs for when --name matches more than one
                                    across different clusters
  -cn, --clusterName <clusterName>  Same as --clusterId but by the cluster's
                                    human-readable name (see cluster:list);
                                    --clusterId wins if both are given
  -h, --help                        display help for command
[36m
--- Subcommand: lambda:test ---[0m
Usage: gcli lambda:test [options]

Test lambda

Options:
  -l, --lambda <lambda>             get by lambda id
  -n, --name <name>                 get by lambda name
  -p, --project <project>           get by lambda name
  -s, --spec <spec>                 get by lambda name
  -qp, --queryParams <queryParams>  Adds query params to request
  -pp, --pathParams <pathParams>    Adds query params to request
  -b, --body <body>                 Add body to request
  -m, --method <method>             HTTP Methods: GET,POST,PUT,DELETE,HEAD. To
                                    mention single method
  -h, --help                        display help for command
[36m
--- Subcommand: lambda:package ---[0m
Usage: gcli lambda:package [options]

Options:
  --name <name>                                    Function name
  --project <project>                              Project in which this lambda is defined
  --env <env>                                      Environment name for function can be NODEJS
  --clusterId <clusterId>                          Disambiguation hint: which of the project's clusters --env lives on (see cluster:list); omit for the shared cluster. Only needed once a project has private clusters and a duplicate-named environment across them.
  --clusterName <clusterName>                      Same as --clusterId but by the cluster's human-readable name (see cluster:list); --clusterId wins if both are given. Can also be set as `clusterName` in the lambforge.yaml spec's function block.
  --method <method...>                             HTTP Methods: GET,POST,PUT,DELETE,HEAD. To mention single method
  --spec <spec>                                    Spec file yml or json path
  --packageJson <packageJson>                      Define packageJson in string format
  --package <package>                              Path to package.json
  --buildBashScript <buildBashScript>              Package build command for builder to run with
  --script <script>                                Package build script path
  --params <params>                                Array from strings which defines route params
  --configs <configs...>                           List of kubernetes config names
  --secrets <secrets...>                           List of kubernetes secret names
  --envSecrets <envSecrets...>                     List of kubernetes secret names projected into process.env (graphql environment only)
  --network <network>                              Can be private or public meaning exposed to the router or just for private available can be both also --network private --network public
  --route <route>                                  Lambda route in which will be accessible
  --code <code>                                    URL or local path for single file source code
  --file <file>                                    Main lambda file
  --customUploadFileId <customUploadFileId>        Id of a pre-uploaded archive to use as the lambda source
  --federation                                     Provision this lambda as a GraphQL Federation gateway instead of a regular function
  --subgraphs <subgraphs...>                       Lambda names (within the project) to expose as subgraphs of the federation gateway
  --mcp                                            Provision this lambda as an Apollo MCP Server in front of a federation graph
  --mcpGraph <mcpGraph>                            Federation gateway lambda name the MCP server connects to (operations/headers via spec yaml)
  --executorType <executorType>                    Executor type for execution; one of 'poolmgr', 'newdeploy'
  --maxCpu <maxCpu>                                Maximum CPU to be assigned to pod (In millicore, minimum 1)
  --minCpu <minCpu>                                Minimum CPU to be assigned to pod (In millicore, minimum 1)
  --maxMemory <maxMemory>                          Maximum memory to be assigned to pod (In megabyte)
  --minMemory <minMemory>                          Minimum memory to be assigned to pod (In megabyte)
  --minScale <minScale>                            Minimum number of pods (Uses resource inputs to configure HPA)
  --maxScale <maxScale>                            Maximum number of pods (Uses resource inputs to configure HPA)
  --targetCpu <targetCpu>                          Target average CPU usage percentage across pods for scaling
  --idleTimeout <idleTimeout>                      The length of time (in seconds) that a function is idle before pod(s) are eligible for recycling
  --concurrency <concurrency>                      Maximum number of pods specialized concurrently to serve requests
  --functionTimeout <functionTimeout>              Maximum time for a request to wait for the response from the function
  --specializationTimeout <specializationTimeout>  Timeout for executor to wait for function pod creation
  -h, --help                                       display help for command
[36m
--- Subcommand: project:list ---[0m
Usage: gcli project:list [options]

List of all projects

Options:
  -h, --help  display help for command
[36m
--- Subcommand: project:use ---[0m
Usage: gcli project:use [options] <project>

Adds default project to be used all around the CLI

Options:
  -h, --help  display help for command
[36m
--- Subcommand: project:clear ---[0m
Usage: gcli project:clear [options]

Clears default project to be used all around the CLI

Options:
  -h, --help  display help for command
[36m
--- Subcommand: build ---[0m
Usage: gcli build [options]

Build bundle using esbuild https://esbuild.github.io 

Options:
  -f, --files <files...>        File or files to bundle defaults to index.ts
  -b, --bundle                  Bundle code (default: true)
  -m, --minify                  Minify code (default: false)
  -p, --platform <char>         Platform  (default: "node")
  -t, --target <char>           Target  (default: "node14.4")
  -o, --outfile <char>          Outfile name
  -e, --external <external...>  External libraries
  -h, --help                    display help for command
[36m
--- Subcommand: environment:list ---[0m
Usage: gcli environment:list [options]

List of all environments for project

Options:
  -p, --project <project>
  -h, --help               display help for command
[36m
--- Subcommand: environment:create ---[0m
Usage: gcli environment:create [options]

Create environment for project

Options:
  -p, --project <project>
  -minCpu, --minCpu <minCpu>
  -maxCpu, --maxCpu <maxCpu>
  -minMemory, --minMemory <minMemory>
  -maxMemory, --maxMemory <maxMemory>
  -poolSize, --poolSize <poolSize>
  -builder, --builder <builder>
  -image, --image <image>
  -name, --name <name>
  -spec, --spec <spec>
  -r, --region <region>                Default region is eu-central 'DEFAULT' |
                                       'EU_BALKANS' | 'EU_CENTRAL'
  -cid, --clusterId <clusterId>        Private cluster this environment should
                                       run on (see cluster:list); omit for the
                                       shared cluster. Immutable after
                                       creation.
  -cn, --clusterName <clusterName>     Same as --clusterId but by the cluster's
                                       human-readable name; --clusterId wins if
                                       both are given. Can also be set as
                                       `clusterName` in env.yaml.
  -h, --help                           display help for command
[36m
--- Subcommand: environment:update ---[0m
Usage: gcli environment:update [options]

Update environment for project

Options:
  -p, --project <project>
  -minCpu, --minCpu <minCpu>
  -maxCpu, --maxCpu <maxCpu>
  -minMemory, --minMemory <minMemory>
  -maxMemory, --maxMemory <maxMemory>
  -poolSize, --poolSize <poolSize>
  -builder, --builder <builder>
  -image, --image <image>
  -name, --name <name>
  -spec, --spec <spec>
  -r, --region <region>                Default region is eu-central 'DEFAULT' |
                                       'EU_BALKANS' | 'EU_CENTRAL'
  -cid, --clusterId <clusterId>        Disambiguates which environment to
                                       update when --name matches more than one
                                       across different clusters (clusterId
                                       itself is immutable and never changed by
                                       this command).
  -cn, --clusterName <clusterName>     Same as --clusterId but by the cluster's
                                       human-readable name; --clusterId wins if
                                       both are given
  -h, --help                           display help for command
[36m
--- Subcommand: environment:delete ---[0m
Usage: gcli environment:delete [options]

Delete environment for project

Options:
  -p, --project <project>
  -n, --name <name>
  -f, --force
  -spec, --spec <spec>
  -cid, --clusterId <clusterId>     Disambiguates which environment to delete
                                    when --name matches more than one across
                                    different clusters
  -cn, --clusterName <clusterName>  Same as --clusterId but by the cluster's
                                    human-readable name; --clusterId wins if
                                    both are given
  -h, --help                        display help for command
[36m
--- Subcommand: environment:get ---[0m
Usage: gcli environment:get [options]

Get environment for project

Options:
  -p, --project <project>
  -n, --name <name>
  -cid, --clusterId <clusterId>     Disambiguates which environment to fetch
                                    when --name matches more than one across
                                    different clusters
  -cn, --clusterName <clusterName>  Same as --clusterId but by the cluster's
                                    human-readable name; --clusterId wins if
                                    both are given
  -h, --help                        display help for command
[36m
--- Subcommand: mcp:start ---[0m
Usage: gcli mcp:start [options]

Start mcp proxy server

Options:
  -u, --url <url>  Specify mcp api url
  -h, --help       display help for command
[36m
--- Subcommand: start ---[0m
Usage: gcli start [options]

Start bundle using esbuild https://esbuild.github.io 

Options:
  -f, --files <files...>        File or files to bundle defaults to index.ts
  -b, --bundle                  Bundle code (default: true)
  -m, --minify                  Minify code (default: false)
  -p, --platform <char>         Platform  (default: "node")
  -t, --target <char>           Target  (default: "node14.4")
  -o, --outfile <char>          Outfile name
  -i, --ignore <ignore...>      Ignore folders from triggering restarts
  -e, --external <external...>  External libraries
  -h, --help                    display help for command
[36m
--- Subcommand: cron:create ---[0m
Usage: gcli cron:create [options]

Create cron

Options:
  -p, --project <project>
  -l, --lambdaName <lambdaName>
  -t, --triggerName <triggerName>
  -c, --cron <cron>
  -h, --help                       display help for command
[36m
--- Subcommand: cron:delete ---[0m
Usage: gcli cron:delete [options]

Delete cron

Options:
  -p, --project <project>
  -l, --lambdaName <lambdaName>
  -h, --help                     display help for command
[36m
--- Subcommand: cron:list ---[0m
Usage: gcli cron:list [options]

List of all cron jobs for project

Options:
  -p, --project <project>
  -h, --help               display help for command
[36m
--- Subcommand: cluster:create ---[0m
Usage: gcli cluster:create [options]

Provision a private Talos cluster for a project (runs in the background - takes several minutes; use --wait to block)

Options:
  -p, --project <project>
  -spec, --spec <spec>
  -n, --name <name>
  --imageId <imageId>        hcloud Talos snapshot id
  --serverType <serverType>
  -l, --location <location>
  --workers <workers>        Worker count (ignored when --singleNode)
  --singleNode               Control plane carries the workload too
  --wait                     Block until the cluster is ready (or errors)
  -h, --help                 display help for command
[36m
--- Subcommand: cluster:apply ---[0m
Usage: gcli cluster:apply [options]

Make a private cluster match the `cluster:` section of lambforge.yaml: creates it if missing, then applies topology, workers, control planes, load balancer and autoscaling

Options:
  -p, --project <project>
  -spec, --spec <spec>     Spec file (default: lambforge.yaml / cluster.yaml)
  --dry-run                Print the plan, change nothing
  --yes                    Also apply steps that remove capacity or the load
                           balancer IP
  -h, --help               display help for command
[36m
--- Subcommand: cluster:list ---[0m
Usage: gcli cluster:list [options]

List every private cluster this project has (it may have several - dev/stage/prod, ...)

Options:
  -p, --project <project>
  -h, --help               display help for command
[36m
--- Subcommand: cluster:teardown ---[0m
Usage: gcli cluster:teardown [options]

Tear down one of a project's clusters (runs in the background - use --wait to block)

Options:
  -p, --project <project>
  -c, --cluster <cluster>  Cluster id (see cluster:list)
  --wait                   Block until the cluster is gone (or errors)
  -h, --help               display help for command
[36m
--- Subcommand: cluster:kubeconfig ---[0m
Usage: gcli cluster:kubeconfig [options]

Print (or save) a cluster's raw kubeconfig YAML - only available once it's 'ready'

Options:
  -p, --project <project>
  -c, --cluster <cluster>  Cluster id (see cluster:list)
  -o, --output <output>    Write to this file instead of stdout
  -h, --help               display help for command
[36m
--- Subcommand: cluster:status ---[0m
Usage: gcli cluster:status [options]

Every cluster's status, agent, nodes, CPU/memory load, autoscaling and open issues (or one with --cluster)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -h, --help                   display help for command
[36m
--- Subcommand: cluster:health ---[0m
Usage: gcli cluster:health [options]

The latest health report of a cluster's agent, with every node

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -h, --help                   display help for command
[36m
--- Subcommand: cluster:scale-events ---[0m
Usage: gcli cluster:scale-events [options]

Manual and autoscaler scale history, newest first

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --limit <limit>              How many events (default 20)
  -h, --help                   display help for command
[36m
--- Subcommand: cluster:cost ---[0m
Usage: gcli cluster:cost [options]

Month-to-date cost and the monthly estimate of the project's private clusters

Options:
  -p, --project <project>
  -h, --help               display help for command
[36m
--- Subcommand: cluster:scale ---[0m
Usage: gcli cluster:scale [options]

Set the number of worker nodes (1-10) of a multi-node cluster - billed per node-hour

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --workers <workers>          Worker nodes, 1-10
  --wait                       Block until the cluster settles
  -h, --help                   display help for command
[36m
--- Subcommand: cluster:scale:control-planes ---[0m
Usage: gcli cluster:scale:control-planes [options]

Set the number of control-plane nodes (1, 3 or 5)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --count <count>              Control planes: 1, 3 or 5
  --wait                       Block until the cluster settles
  -h, --help                   display help for command
[36m
--- Subcommand: cluster:autoscale ---[0m
Usage: gcli cluster:autoscale [options]

Change the worker autoscaling policy - only the flags you pass change

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --enable                     Turn autoscaling on (multi-node clusters only)
  --disable                    Turn autoscaling off
  --min <min>                  Minimum workers (1-10)
  --max <max>                  Maximum workers (1-10)
  --cpuUp <percent>            Scale up at this CPU % (1-100)
  --memUp <percent>            Scale up at this memory % (1-100)
  --cpuDown <percent>          Scale down below this CPU % (1-100)
  --memDown <percent>          Scale down below this memory % (1-100)
  --samples <n>                Consecutive readings before acting (1-20)
  --cooldown <minutes>         Minutes between scale actions (1-1440)
  -h, --help                   display help for command
[36m
--- Subcommand: cluster:multi-node ---[0m
Usage: gcli cluster:multi-node [options]

Convert a single-node cluster to dedicated worker nodes (required for autoscaling)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --workers <workers>          Worker nodes, 1-10
  --wait                       Block until the cluster settles
  -h, --help                   display help for command
[36m
--- Subcommand: cluster:single-node ---[0m
Usage: gcli cluster:single-node [options]

Convert a multi-node cluster back to a single node (removes the worker nodes)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --wait                       Block until the cluster settles
  -h, --help                   display help for command
[36m
--- Subcommand: cluster:load-balancer ---[0m
Usage: gcli cluster:load-balancer [options]

Add or remove the cluster's load balancer (billed per hour while enabled)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --enable                     Add the load balancer
  --disable                    Remove the load balancer
  --wait                       Block until the cluster settles
  -h, --help                   display help for command
[36m
--- Subcommand: rabbitmq:create ---[0m
Usage: gcli rabbitmq:create [options]

Provision a RabbitMQ broker for a project (a project may have several)

Options:
  -p, --project <project>
  -spec, --spec <spec>
  -n, --name <name>
  -d, --description <description>
  -u, --user <user>
  --password <password>
  -r, --region <region>            'DEFAULT' | 'EU_BALKANS' | 'EU_CENTRAL'
  -c, --cluster <cluster>          Which private cluster to provision this
                                   broker on; omit for the shared cluster
  -h, --help                       display help for command
[36m
--- Subcommand: rabbitmq:list ---[0m
Usage: gcli rabbitmq:list [options]

List every RabbitMQ broker for a project

Options:
  -p, --project <project>
  -h, --help               display help for command
[36m
--- Subcommand: rabbitmq:delete ---[0m
Usage: gcli rabbitmq:delete [options]

Delete a RabbitMQ broker

Options:
  -p, --project <project>
  --id <id>                Broker id (see rabbitmq:list)
  -h, --help               display help for command
[36m
--- Subcommand: plugin:list ---[0m
Usage: gcli plugin:list [options]

List every plugin available in the marketplace catalog

Options:
  -h, --help  display help for command
[36m
--- Subcommand: plugin:installed ---[0m
Usage: gcli plugin:installed [options]

List plugins installed for a project (may include the same plugin on several clusters)

Options:
  -p, --project <project>
  -h, --help               display help for command
[36m
--- Subcommand: plugin:install ---[0m
Usage: gcli plugin:install [options]

Install a marketplace plugin for a project

Options:
  -p, --project <project>
  -spec, --spec <spec>
  -n, --name <name>        Plugin name, e.g. redis-plugin
  -c, --cluster <cluster>  Which private cluster to install into; omit for the
                           shared cluster
  -h, --help               display help for command
[36m
--- Subcommand: plugin:uninstall ---[0m
Usage: gcli plugin:uninstall [options]

Uninstall a plugin from a project (--cluster picks which installation, if it's on several)

Options:
  -p, --project <project>
  -n, --name <name>        Plugin name
  -c, --cluster <cluster>
  -h, --help               display help for command
[36m
--- Subcommand: runner:start ---[0m
Usage: gcli runner:start [options]

Connect this machine's Ollama to the Lambforge chat as a local AI runner (outbound connection only - works behind NAT, Ollama is never exposed)

Options:
  -n, --name <name>    Runner name shown in the chat model picker (default:
                       hostname)
  -t, --token <token>  Runner token from Profile -> Local AI runners (instead
                       of `gcli login`)
  --ollama <url>       Ollama URL (default: $OLLAMA_HOST or
                       http://127.0.0.1:11434)
  --wsUrl <url>        Lambforge subscriptions endpoint override
  --reset              Forget the saved runner and register a new one
  -h, --help           display help for command
[36m
--- Subcommand: runner:daemon:install ---[0m
Usage: gcli runner:daemon:install|runner:start:daemon [options]

Run the runner in the background as a systemd user service: starts with your session, restarts on failure (Linux)

Options:
  -n, --name <name>    Runner name when registering (default: hostname)
  -t, --token <token>  Runner token for a machine without `gcli login`
  --ollama <url>       Ollama URL (default: $OLLAMA_HOST or
                       http://127.0.0.1:11434)
  --wsUrl <url>        Lambforge subscriptions endpoint override
  --reset              Forget the saved runner and register a new one
  --service <name>     systemd unit name (default: lambforge-runner)
  --dry-run            Print the unit file instead of installing it
  -h, --help           display help for command
[36m
--- Subcommand: runner:daemon:status ---[0m
Usage: gcli runner:daemon:status [options]

Show the runner service status (systemctl --user status)

Options:
  --service <name>  systemd unit name (default: lambforge-runner)
  -h, --help        display help for command
[36m
--- Subcommand: runner:daemon:logs ---[0m
Usage: gcli runner:daemon:logs [options]

Follow the runner service log (journalctl --user -f)

Options:
  --service <name>  systemd unit name (default: lambforge-runner)
  --lines <n>       Lines of history to show first (default 50)
  -h, --help        display help for command
[36m
--- Subcommand: runner:daemon:uninstall ---[0m
Usage: gcli runner:daemon:uninstall [options]

Stop and remove the runner service (the runner stays registered)

Options:
  --service <name>  systemd unit name (default: lambforge-runner)
  -h, --help        display help for command
[36m
--- Subcommand: runner:list ---[0m
Usage: gcli runner:list [options]

List your local AI runners and the models they serve

Options:
  -h, --help  display help for command
[36m
--- Subcommand: runner:models ---[0m
Usage: gcli runner:models [options]

Choose which of a runner's models appear in the chat model picker (no flags: list them)

Options:
  --id <id>        Runner id (default: the runner saved on this machine)
  --show <models>  Comma-separated models to show (hides the rest)
  --all            Show every model again
  --none           Hide all models of this runner from the chat
  -h, --help       display help for command
[36m
--- Subcommand: runner:delete ---[0m
Usage: gcli runner:delete [options]

Delete a local AI runner and revoke its token

Options:
  --id <id>   Runner id (default: the runner saved on this machine)
  -h, --help  display help for command
