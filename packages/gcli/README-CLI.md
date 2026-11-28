Usage: gcli [options] [command]

Options:
  -V, --version                                        output the version number
  -h, --help                                           display help for command

Commands:
  login [options]                                      Log in. Without --token: prints a link, opens your browser and waits for you to approve it on lambforge.com
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
  mq-trigger:list [options]                            List the message-queue triggers of a project
  mq-trigger:create [options]                          Run a lambda for every message on a RabbitMQ queue
  mq-trigger:update [options]                          Change a message-queue trigger (same flags as create)
  mq-trigger:apply [options]                           Create or update the message-queue triggers listed under triggers.mq in lambforge.yaml
  mq-trigger:delete [options]                          Delete a message-queue trigger
  cluster:create [options]                             Provision a private Talos cluster, or with --virtual a virtual cluster, for a project (runs in the background; use --wait to block)
  cluster:apply [options]                              Make a private cluster match the `cluster:` section of lambforge.yaml: creates it if missing, then applies topology, workers, control planes, load balancer and autoscaling
  cluster:list [options]                               List every private cluster this project has (it may have several - dev/stage/prod, ...)
  cluster:teardown [options]                           Tear down one of a project's clusters (runs in the background - use --wait to block)
  cluster:kubeconfig [options]                         Print (or save) a cluster's raw kubeconfig YAML - only available once it's 'ready'
  cluster:status [options]                             Every cluster's status, agent, nodes, CPU/memory load, autoscaling and open issues (or one with --cluster)
  cluster:attach [options]                             Attach a machine you own (booted from the Talos ISO, on this network) to a Talos cluster as an extra worker - its install disk is WIPED
  cluster:nodes [options]                              Every node of a cluster: its Hetzner control planes and workers and the machines attached to it
  cluster:pause [options]                              Pause an attached machine (cordon): nothing new runs there, running work stays
  cluster:resume [options]                             Let new work run on a paused machine again (uncordon)
  cluster:node-storage [options]                       Let an attached machine carry volumes on its own disk (it restarts once), or stop with --off
  cluster:reset-machine [options]                      Bring a detached machine back to maintenance mode to attach it again (wipes its config and data, keeps the boot loader)
  cluster:talosconfig [options]                        A short-lived talosconfig for one of your Talos clusters (admin of its machines with talosctl) - printed, or saved with -o
  cluster:detach [options]                             Drain and remove an attached machine from a cluster (reset the machine afterwards)
  cluster:health [options]                             A cluster's health as a dashboard: CPU/memory requested and used (of what the cluster may use), nodes and open issues
  cluster:scale-events [options]                       Manual and autoscaler scale history, newest first
  cluster:cost [options]                               Month-to-date cost and the monthly estimate of the project's private clusters
  cluster:scale [options]                              Set the number of worker nodes (1-10) of a multi-node cluster - billed per node-hour
  cluster:scale:control-planes [options]               Set the number of control-plane nodes (1, 3 or 5)
  cluster:autoscale [options]                          Change the worker autoscaling policy - only the flags you pass change
  cluster:plan [options]                               Why pods are pending and what the pods-mode autoscaler would do: a verdict per pod, the nodes it would create, consolidation
  cluster:multi-node [options]                         Convert a single-node cluster to dedicated worker nodes (required for autoscaling)
  cluster:single-node [options]                        Convert a multi-node cluster back to a single node (removes the worker nodes)
  cluster:load-balancer [options]                      Add or remove the cluster's load balancer (billed per hour while enabled). On a virtual cluster this is its dedicated LB - its own IP; the platform subdomain keeps working either way
  rabbitmq:create [options]                            Provision a RabbitMQ broker for a project (a project may have several)
  rabbitmq:list [options]                              List every RabbitMQ broker for a project
  queue:declare [options]                              Declare queues on a RabbitMQ broker of the project (skips the ones it has)
  rabbitmq:delete [options]                            Delete a RabbitMQ broker
  plugin:list                                          List every plugin available in the marketplace catalog
  plugin:installed [options]                           List plugins installed for a project (may include the same plugin on several clusters)
  plugin:install [options]                             Install a marketplace plugin for a project
  plugin:uninstall [options]                           Uninstall a plugin from a project (--cluster picks which installation, if it's on several)
  runner:start [options]                               Connect this machine's model servers (Ollama, Strata or any OpenAI-compatible server) to the Lambforge chat as a local AI runner (outbound connection only - works behind NAT, nothing is exposed)
  runner:daemon:install|runner:start:daemon [options]  Run the runner in the background as a systemd user service: starts with your session, restarts on failure (Linux)
  runner:daemon:status [options]                       Show the runner service status (systemctl --user status)
  runner:daemon:start [options]                        Start the installed runner service, and report whether it stays up
  runner:daemon:stop [options]                         Stop the runner service (it stays installed and starts at your next login)
  runner:daemon:restart [options]                      Restart the runner service (e.g. after `gcli login` to another server)
  runner:daemon:logs [options]                         Follow the runner service log (journalctl --user -f)
  runner:daemon:uninstall [options]                    Stop and remove the runner service (the runner stays registered)
  runner:list                                          List your local AI runners and the models they serve
  runner:models [options]                              Choose which of a runner's models appear in the chat model picker (no flags: list them)
  runner:delete [options]                              Delete a local AI runner and revoke its token
  workspace:start [options]                            Connect the current directory to the Lambforge chat as a local workspace: the AI agents can read/edit its files and run commands here (outbound connection only - works behind NAT)
  workspace:list [options]                             List your local workspaces (online status, directory, processes)
  workspace:delete [options]                           Delete a local workspace and revoke its token (default: the one registered for this directory)
  workflow:list [options]                              List the project workflows
  workflow:get [options]                               Print a workflow as YAML (the format workflow:apply reads), or write it with -o
  workflow:generate [options]                          Draft a workflow with AI from plain language (or change one with --name / --from). Prints or writes YAML; saves only with --apply
  workflow:apply [options]                             Create or update a workflow from a YAML/JSON file (workflow: {name, description, definition})
  workflow:validate [options]                          Check a workflow file against the cluster (lambdas exist, graph is valid)
  workflow:delete [options]                            Delete a workflow and all of its runs
  workflow:run [options]                               Start a run; the JSON input is the first step request body. --wait follows it to the end
  workflow:runs [options]                              List a workflow runs, newest first
  workflow:status [options]                            Show a run: its step events, error and output (--follow until it ends)
  workflow:cancel [options]                            Cancel a running run
  workflow:trigger:add [options]                       Start runs from an HTTP URL (--http; the JSON body is the input) or a schedule (--cron). Needs runtime 1.26+ on the cluster
  workflow:trigger:list [options]                      List a workflow HTTP and schedule triggers
  workflow:trigger:remove [options]                    Remove a workflow trigger
  domain:list [options]                                List the domains and platform names of a project
  domain:apply [options]                               Claim, add and route the domains listed under domains: in lambforge.yaml
  validate [options] [path]                            Check every lambforge.yaml of the repository (unknown keys, wrong types, clashing names); --online also against the live platform API
  plan [options] [path]                                Compare every lambforge.yaml of the repository with what runs in the project: in sync, will change, missing, unmanaged
  apply [options] [path]                               Make every lambforge.yaml of the repository true: shows the plan, asks, then creates / updates environments, lambdas (waiting for each build), time + queue triggers and domains. Never deletes.
  export [options] <lambda>                            Generate a lambforge.yaml from a running lambda (function, environment, time trigger, domains) - secret and config names only
  lambda:resources [options]                           What each lambda really uses next to what it reserves, and the right-sized CPU / memory (raise / lower / keep, cost now vs recommended); --auto keeps one sized automatically
  plugin:resources [options]                           What each installed plugin (Redis, MongoDB, NATS, ...) really uses per instance, and the right-sized CPU / memory; --apply sets it
  plugin:auto-grow [options] <plugin>                  Whether the plugin's volume grows to the next size by itself at 90 % full (on by default) or only warns
  sleep-schedule:list [options]                        The project's sleep schedules: hours, days, time zone, paused, state and the lambdas following each (scaleOptions.sleepSchedule)
  sleep-schedule:set [options] <name>                  Create or change a named sleep schedule (only the flags given change; applies at once). Outside its hours the lambdas following it scale to 0 (plugins keep running)
  sleep-schedule:delete [options] <name>               Delete a sleep schedule (refused while lambdas follow it - change their scaleOptions.sleepSchedule first)
  sleep-schedule:sleep [options] <name>                Put the schedule's lambdas to sleep now, until its next wake time
  sleep-schedule:wake [options] <name>                 Wake the schedule's lambdas now, until its next sleep time
  project:savings [options]                            What the platform saved this month: fewer / cheaper machines, hours asleep, lambdas sized down automatically
  cluster:pod-placement [options]                      How a Talos cluster's scheduler places new pods: spread (emptiest machine) or fill (pack machines, so the autoscaler can remove empty ones). Changed live, no reboot
  help [command]                                       display help for command
i  
   --- Subcommand: login ---
Usage: gcli login [options]

Log in. Without --token: prints a link, opens your browser and waits for you to approve it on lambforge.com

Options:
  --no-browser            Only print the login link, do not open a browser
  -k, --key <key>         Specify api key
  -uu, --uploadUrl <key>  Specify upload server
  -ci, --ci               Initialize directories for CI/CD purposes
  -t, --token <token>     Specify custom token generated from the website
  -u, --url <url>         Specify api url
  -h, --help              display help for command
i  
   --- Subcommand: lambda:list ---
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
i  
   --- Subcommand: lambda:get ---
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
i  
   --- Subcommand: lambda:create ---
Usage: gcli lambda:create [options]

Options:
  --name <name>                                    Function name
  --project <project>                              Project in which this lambda is defined
  --env <env>                                      Environment name for function can be NODEJS
  --clusterId <clusterId>                          Disambiguation hint: which of the project's clusters --env lives on (see cluster:list); omit for the shared cluster. Only needed once a project has private clusters and a duplicate-named environment across them.
  --clusterName <clusterName>                      Same as --clusterId but by the cluster's human-readable name (see cluster:list); --clusterId wins if both are given. Can also be set as `clusterName` in the lambforge.yaml spec's function block.
  --method <method...>                             HTTP Methods: GET,POST,PUT,DELETE,HEAD. To mention single method
  --spec <spec>                                    Spec file yml or json path
  --no-wait                                        Return once the lambda is saved, without waiting for the build and rollout
  --json                                           Print the saved lambda as JSON on stdout (progress goes to stderr)
  --packageJson <packageJson>                      Define packageJson in string format
  --package <package>                              Path to package.json
  --buildBashScript <buildBashScript>              Package build command for builder to run with
  --script <script>                                Package build script path
  --params <params>                                Array from strings which defines route params
  --configs <configs...>                           List of kubernetes config names
  --secrets <secrets...>                           List of kubernetes secret names
  --envSecrets <envSecrets...>                     List of kubernetes secret names projected into process.env (graphql environment only)
  --bodyLimit <bodyLimit>                          Largest request body the lambda accepts, e.g. 20mb (default 10mb, max 100mb)
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
  --spread <spread>                                Where the replicas run (newdeploy): 'machines' = on different machines of the cluster, as evenly as possible; 'none' = the scheduler decides
  --spreadStrict <spreadStrict>                    With --spread machines: 'true' = a replica waits rather than share a machine; 'false' (default) = prefer different machines, never block a scale-up
  --sleepSchedule <name>                           The project's sleep schedule this lambda follows (see sleep-schedule:list); outside its hours it scales to 0. '' = always on. newdeploy with minScale >= 1 only
  -h, --help                                       display help for command
i  
   --- Subcommand: lambda:update ---
Usage: gcli lambda:update [options]

Options:
  --name <name>                                    Function name
  --project <project>                              Project in which this lambda is defined
  --env <env>                                      Environment name for function can be NODEJS
  --clusterId <clusterId>                          Disambiguation hint: which of the project's clusters --env lives on (see cluster:list); omit for the shared cluster. Only needed once a project has private clusters and a duplicate-named environment across them.
  --clusterName <clusterName>                      Same as --clusterId but by the cluster's human-readable name (see cluster:list); --clusterId wins if both are given. Can also be set as `clusterName` in the lambforge.yaml spec's function block.
  --method <method...>                             HTTP Methods: GET,POST,PUT,DELETE,HEAD. To mention single method
  --spec <spec>                                    Spec file yml or json path
  --no-wait                                        Return once the lambda is saved, without waiting for the build and rollout
  --json                                           Print the saved lambda as JSON on stdout (progress goes to stderr)
  --packageJson <packageJson>                      Define packageJson in string format
  --package <package>                              Path to package.json
  --buildBashScript <buildBashScript>              Package build command for builder to run with
  --script <script>                                Package build script path
  --params <params>                                Array from strings which defines route params
  --configs <configs...>                           List of kubernetes config names
  --secrets <secrets...>                           List of kubernetes secret names
  --envSecrets <envSecrets...>                     List of kubernetes secret names projected into process.env (graphql environment only)
  --bodyLimit <bodyLimit>                          Largest request body the lambda accepts, e.g. 20mb (default 10mb, max 100mb)
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
  --spread <spread>                                Where the replicas run (newdeploy): 'machines' = on different machines of the cluster, as evenly as possible; 'none' = the scheduler decides
  --spreadStrict <spreadStrict>                    With --spread machines: 'true' = a replica waits rather than share a machine; 'false' (default) = prefer different machines, never block a scale-up
  --sleepSchedule <name>                           The project's sleep schedule this lambda follows (see sleep-schedule:list); outside its hours it scales to 0. '' = always on. newdeploy with minScale >= 1 only
  -h, --help                                       display help for command
i  
   --- Subcommand: lambda:delete ---
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
i  
   --- Subcommand: lambda:log ---
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
i  
   --- Subcommand: lambda:build:log ---
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
i  
   --- Subcommand: lambda:test ---
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
i  
   --- Subcommand: lambda:package ---
Usage: gcli lambda:package [options]

Options:
  --name <name>                                    Function name
  --project <project>                              Project in which this lambda is defined
  --env <env>                                      Environment name for function can be NODEJS
  --clusterId <clusterId>                          Disambiguation hint: which of the project's clusters --env lives on (see cluster:list); omit for the shared cluster. Only needed once a project has private clusters and a duplicate-named environment across them.
  --clusterName <clusterName>                      Same as --clusterId but by the cluster's human-readable name (see cluster:list); --clusterId wins if both are given. Can also be set as `clusterName` in the lambforge.yaml spec's function block.
  --method <method...>                             HTTP Methods: GET,POST,PUT,DELETE,HEAD. To mention single method
  --spec <spec>                                    Spec file yml or json path
  --no-wait                                        Return once the lambda is saved, without waiting for the build and rollout
  --json                                           Print the saved lambda as JSON on stdout (progress goes to stderr)
  --packageJson <packageJson>                      Define packageJson in string format
  --package <package>                              Path to package.json
  --buildBashScript <buildBashScript>              Package build command for builder to run with
  --script <script>                                Package build script path
  --params <params>                                Array from strings which defines route params
  --configs <configs...>                           List of kubernetes config names
  --secrets <secrets...>                           List of kubernetes secret names
  --envSecrets <envSecrets...>                     List of kubernetes secret names projected into process.env (graphql environment only)
  --bodyLimit <bodyLimit>                          Largest request body the lambda accepts, e.g. 20mb (default 10mb, max 100mb)
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
  --spread <spread>                                Where the replicas run (newdeploy): 'machines' = on different machines of the cluster, as evenly as possible; 'none' = the scheduler decides
  --spreadStrict <spreadStrict>                    With --spread machines: 'true' = a replica waits rather than share a machine; 'false' (default) = prefer different machines, never block a scale-up
  --sleepSchedule <name>                           The project's sleep schedule this lambda follows (see sleep-schedule:list); outside its hours it scales to 0. '' = always on. newdeploy with minScale >= 1 only
  -h, --help                                       display help for command
i  
   --- Subcommand: project:list ---
Usage: gcli project:list [options]

List of all projects

Options:
  -h, --help  display help for command
i  
   --- Subcommand: project:use ---
Usage: gcli project:use [options] <project>

Adds default project to be used all around the CLI

Options:
  -h, --help  display help for command
i  
   --- Subcommand: project:clear ---
Usage: gcli project:clear [options]

Clears default project to be used all around the CLI

Options:
  -h, --help  display help for command
i  
   --- Subcommand: build ---
Usage: gcli build [options]

Build bundle using esbuild https://esbuild.github.io 

Options:
  -f, --files <files...>        File or files to bundle (default: function.file
                                from lambforge.yaml, else index.ts)
  -b, --bundle                  Bundle code (default: options.bundler.bundle,
                                else true)
  -m, --minify                  Minify code (default: options.bundler.minify,
                                else false)
  -p, --platform <char>         Platform  (default: "node")
  -t, --target <char>           Target (default: options.bundler.target, else
                                node24)
  -o, --outfile <char>          Outfile name (default: options.bundler.outfile,
                                else index.js)
  -e, --external <external...>  External libraries
  -h, --help                    display help for command
i  
   --- Subcommand: environment:list ---
Usage: gcli environment:list [options]

List of all environments for project

Options:
  -p, --project <project>
  -h, --help               display help for command
i  
   --- Subcommand: environment:create ---
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
i  
   --- Subcommand: environment:update ---
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
i  
   --- Subcommand: environment:delete ---
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
i  
   --- Subcommand: environment:get ---
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
i  
   --- Subcommand: mcp:start ---
Usage: gcli mcp:start [options]

Start mcp proxy server

Options:
  -u, --url <url>  Specify mcp api url
  -h, --help       display help for command
i  
   --- Subcommand: start ---
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
i  
   --- Subcommand: cron:create ---
Usage: gcli cron:create [options]

Create cron

Options:
  -p, --project <project>
  -l, --lambdaName <lambdaName>
  -t, --triggerName <triggerName>
  -c, --cron <cron>
  -h, --help                       display help for command
i  
   --- Subcommand: cron:delete ---
Usage: gcli cron:delete [options]

Delete cron

Options:
  -p, --project <project>
  -l, --lambdaName <lambdaName>
  -h, --help                     display help for command
i  
   --- Subcommand: cron:list ---
Usage: gcli cron:list [options]

List of all cron jobs for project

Options:
  -p, --project <project>
  -h, --help               display help for command
i  
   --- Subcommand: mq-trigger:list ---
Usage: gcli mq-trigger:list [options]

List the message-queue triggers of a project

Options:
  -p, --project <project>
  -h, --help               display help for command
i  
   --- Subcommand: mq-trigger:create ---
Usage: gcli mq-trigger:create [options]

Run a lambda for every message on a RabbitMQ queue

Options:
  -p, --project <project>
  -n, --name <name>             Trigger name
  -l, --lambda <lambda>         Lambda the trigger runs per message
  --request-topic <queue>       Queue the trigger consumes
  --response-topic <queue>      Queue for the lambda response
  --error-topic <queue>         Queue for failed messages
  --broker <rabbitMqId>         RabbitMQ broker id (see rabbitmq:list) - needed
                                when several brokers share queue names
  --max-retries <n>
  --cool-down-period <seconds>
  --polling-interval <seconds>
  --min-replicas <n>
  --max-replicas <n>
  --threshold <n>               Messages per replica before scaling out
  -h, --help                    display help for command
i  
   --- Subcommand: mq-trigger:update ---
Usage: gcli mq-trigger:update [options]

Change a message-queue trigger (same flags as create)

Options:
  -p, --project <project>
  -n, --name <name>             Trigger name
  -l, --lambda <lambda>         Lambda the trigger runs per message
  --request-topic <queue>       Queue the trigger consumes
  --response-topic <queue>      Queue for the lambda response
  --error-topic <queue>         Queue for failed messages
  --broker <rabbitMqId>         RabbitMQ broker id (see rabbitmq:list) - needed
                                when several brokers share queue names
  --max-retries <n>
  --cool-down-period <seconds>
  --polling-interval <seconds>
  --min-replicas <n>
  --max-replicas <n>
  --threshold <n>               Messages per replica before scaling out
  -h, --help                    display help for command
i  
   --- Subcommand: mq-trigger:apply ---
Usage: gcli mq-trigger:apply [options]

Create or update the message-queue triggers listed under triggers.mq in lambforge.yaml

Options:
  -p, --project <project>
  -spec, --spec <spec>
  -h, --help               display help for command
i  
   --- Subcommand: mq-trigger:delete ---
Usage: gcli mq-trigger:delete [options]

Delete a message-queue trigger

Options:
  -p, --project <project>
  -n, --name <name>        Trigger name
  -h, --help               display help for command
i  
   --- Subcommand: cluster:create ---
Usage: gcli cluster:create [options]

Provision a private Talos cluster, or with --virtual a virtual cluster, for a project (runs in the background; use --wait to block)

Options:
  -p, --project <project>
  -spec, --spec <spec>
  -n, --name <name>
  --imageId <imageId>        hcloud Talos snapshot id
  --serverType <serverType>
  -l, --location <location>
  --workers <workers>        Worker count (ignored when --singleNode)
  --singleNode               Control plane carries the workload too
  --virtual                  A virtual cluster (own Kubernetes API + the
                             Lambforge runtime, no servers, ~2 minutes) instead
                             of a private Talos cluster
  --host <host>              With --virtual: name of a private cluster of this
                             project to run on (default: the shared cluster)
  --dedicated-lb             With --virtual: give its router its own load
                             balancer IP (billed per hour); without it lambdas
                             are served on the platform subdomain
  --wait                     Block until the cluster is ready (or errors)
  -h, --help                 display help for command
i  
   --- Subcommand: cluster:apply ---
Usage: gcli cluster:apply [options]

Make a private cluster match the `cluster:` section of lambforge.yaml: creates it if missing, then applies topology, workers, control planes, load balancer and autoscaling

Options:
  -p, --project <project>
  -spec, --spec <spec>     Spec file (default: lambforge.yaml / cluster.yaml)
  --dry-run                Print the plan, change nothing
  --yes                    Also apply steps that remove capacity or the load
                           balancer IP
  -h, --help               display help for command
i  
   --- Subcommand: cluster:list ---
Usage: gcli cluster:list [options]

List every private cluster this project has (it may have several - dev/stage/prod, ...)

Options:
  -p, --project <project>
  -h, --help               display help for command
i  
   --- Subcommand: cluster:teardown ---
Usage: gcli cluster:teardown [options]

Tear down one of a project's clusters (runs in the background - use --wait to block)

Options:
  -p, --project <project>
  -c, --cluster <cluster>  Cluster id (see cluster:list)
  --wait                   Block until the cluster is gone (or errors)
  -h, --help               display help for command
i  
   --- Subcommand: cluster:kubeconfig ---
Usage: gcli cluster:kubeconfig [options]

Print (or save) a cluster's raw kubeconfig YAML - only available once it's 'ready'

Options:
  -p, --project <project>
  -c, --cluster <cluster>  Cluster id (see cluster:list)
  -o, --output <output>    Write to this file instead of stdout
  -h, --help               display help for command
i  
   --- Subcommand: cluster:status ---
Usage: gcli cluster:status [options]

Every cluster's status, agent, nodes, CPU/memory load, autoscaling and open issues (or one with --cluster)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --json                       Machine-readable output
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:attach ---
Usage: gcli cluster:attach [options]

Attach a machine you own (booted from the Talos ISO, on this network) to a Talos cluster as an extra worker - its install disk is WIPED

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --node-ip <nodeIp>           The machine's address on your network
  -n, --name <name>            Machine name = hostname, e.g. home-1
  --pool <pool>                Pool label lambforge.io/pool (default "default")
  --reserved                   Only workloads that tolerate the pool run there
                               (default: plain extra capacity)
  --disk <disk>                Install disk, e.g. /dev/nvme0n1 (WIPED)
  --storage                    The machine also carries volumes on its own disk
                               (default: lambdas only)
  --yes                        Do not ask before wiping the disk
  --no-wait                    Do not wait for the machine to join
  --timeout <minutes>          How long to wait for the join (default 10)
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:nodes ---
Usage: gcli cluster:nodes [options]

Every node of a cluster: its Hetzner control planes and workers and the machines attached to it

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:pause ---
Usage: gcli cluster:pause [options]

Pause an attached machine (cordon): nothing new runs there, running work stays

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -n, --name <name>            Machine name (see cluster:nodes)
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:resume ---
Usage: gcli cluster:resume [options]

Let new work run on a paused machine again (uncordon)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -n, --name <name>            Machine name (see cluster:nodes)
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:node-storage ---
Usage: gcli cluster:node-storage [options]

Let an attached machine carry volumes on its own disk (it restarts once), or stop with --off

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -n, --name <name>            Machine name (see cluster:nodes)
  --off                        Stop carrying volumes (refused while it holds
                               one)
  --no-wait                    Do not wait until the machine is ready
  --timeout <minutes>          How long to wait (default 40)
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:reset-machine ---
Usage: gcli cluster:reset-machine [options]

Bring a detached machine back to maintenance mode to attach it again (wipes its config and data, keeps the boot loader)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -n, --name <name>            Machine name
  --node-ip <nodeIp>           The machine's address on your network
  --yes                        Do not ask for confirmation
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:talosconfig ---
Usage: gcli cluster:talosconfig [options]

A short-lived talosconfig for one of your Talos clusters (admin of its machines with talosctl) - printed, or saved with -o

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -o, --output <output>        Write to this file (mode 600) instead of stdout
  --ttl <minutes>              How long it works, 5 to 1440 minutes (default
                               60)
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:detach ---
Usage: gcli cluster:detach [options]

Drain and remove an attached machine from a cluster (reset the machine afterwards)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -n, --name <name>            Machine name (see cluster:nodes)
  --yes                        Do not ask for confirmation
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:health ---
Usage: gcli cluster:health [options]

A cluster's health as a dashboard: CPU/memory requested and used (of what the cluster may use), nodes and open issues

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -w, --watch [seconds]        Redraw every 30 s (or the given seconds) until
                               Ctrl+C
  --json                       Machine-readable output
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:scale-events ---
Usage: gcli cluster:scale-events [options]

Manual and autoscaler scale history, newest first

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --limit <limit>              How many events (default 20)
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:cost ---
Usage: gcli cluster:cost [options]

Month-to-date cost and the monthly estimate of the project's private clusters

Options:
  -p, --project <project>
  -h, --help               display help for command
i  
   --- Subcommand: cluster:scale ---
Usage: gcli cluster:scale [options]

Set the number of worker nodes (1-10) of a multi-node cluster - billed per node-hour

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --workers <workers>          Worker nodes, 1-10
  --wait                       Block until the cluster settles
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:scale:control-planes ---
Usage: gcli cluster:scale:control-planes [options]

Set the number of control-plane nodes (1, 3 or 5)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --count <count>              Control planes: 1, 3 or 5
  --wait                       Block until the cluster settles
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:autoscale ---
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
  --profile <profile>          conservative | balanced | aggressive presets the
                               thresholds above; custom uses them as given
  --serverTypes <types>        Comma-separated worker server types in order of
                               preference, e.g. cx33,cpx22 (the next is used
                               when one is out of stock); "" = the cluster's
                               own type
  --step <n>                   Workers added per scale-up (1-3, custom profile)
  --mode <mode>                thresholds (CPU/memory %) | pods (create the
                               cheapest nodes that fit unschedulable pods)
  --consolidation              pods mode: remove the newest worker when its
                               pods fit elsewhere
  --no-consolidation           pods mode: never remove workers by itself
  --replace-cheaper            pods mode: swap a worker for one cheaper machine
                               that holds all its pods (default on)
  --no-replace-cheaper         pods mode: never replace a worker by a cheaper
                               type
  --minNodeAge <minutes>       pods mode: never remove a worker younger than
                               this (5-1440)
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:plan ---
Usage: gcli cluster:plan [options]

Why pods are pending and what the pods-mode autoscaler would do: a verdict per pod, the nodes it would create, consolidation

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:multi-node ---
Usage: gcli cluster:multi-node [options]

Convert a single-node cluster to dedicated worker nodes (required for autoscaling)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --workers <workers>          Worker nodes, 1-10
  --wait                       Block until the cluster settles
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:single-node ---
Usage: gcli cluster:single-node [options]

Convert a multi-node cluster back to a single node (removes the worker nodes)

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --wait                       Block until the cluster settles
  -h, --help                   display help for command
i  
   --- Subcommand: cluster:load-balancer ---
Usage: gcli cluster:load-balancer [options]

Add or remove the cluster's load balancer (billed per hour while enabled). On a virtual cluster this is its dedicated LB - its own IP; the platform subdomain keeps working either way

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --enable                     Add the load balancer
  --disable                    Remove the load balancer
  --wait                       Block until the cluster settles
  -h, --help                   display help for command
i  
   --- Subcommand: rabbitmq:create ---
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
i  
   --- Subcommand: rabbitmq:list ---
Usage: gcli rabbitmq:list [options]

List every RabbitMQ broker for a project

Options:
  -p, --project <project>
  -h, --help               display help for command
i  
   --- Subcommand: queue:declare ---
Usage: gcli queue:declare [options]

Declare queues on a RabbitMQ broker of the project (skips the ones it has)

Options:
  -p, --project <project>
  -n, --name <name>        Queue name; repeat for several. Without it:
                           queues.declare in lambforge.yaml
  --broker <broker>        Broker name or id (see rabbitmq:list); optional when
                           the project has one
  -spec, --spec <spec>
  -h, --help               display help for command
i  
   --- Subcommand: rabbitmq:delete ---
Usage: gcli rabbitmq:delete [options]

Delete a RabbitMQ broker

Options:
  -p, --project <project>
  --id <id>                Broker id (see rabbitmq:list)
  -h, --help               display help for command
i  
   --- Subcommand: plugin:list ---
Usage: gcli plugin:list [options]

List every plugin available in the marketplace catalog

Options:
  -h, --help  display help for command
i  
   --- Subcommand: plugin:installed ---
Usage: gcli plugin:installed [options]

List plugins installed for a project (may include the same plugin on several clusters)

Options:
  -p, --project <project>
  -h, --help               display help for command
i  
   --- Subcommand: plugin:install ---
Usage: gcli plugin:install [options]

Install a marketplace plugin for a project

Options:
  -p, --project <project>
  -spec, --spec <spec>
  -n, --name <name>        Plugin name, e.g. redis-plugin
  -c, --cluster <cluster>  Which private cluster to install into; omit for the
                           shared cluster
  -h, --help               display help for command
i  
   --- Subcommand: plugin:uninstall ---
Usage: gcli plugin:uninstall [options]

Uninstall a plugin from a project (--cluster picks which installation, if it's on several)

Options:
  -p, --project <project>
  -n, --name <name>        Plugin name
  -c, --cluster <cluster>
  -h, --help               display help for command
i  
   --- Subcommand: runner:start ---
Usage: gcli runner:start [options]

Connect this machine's model servers (Ollama, Strata or any OpenAI-compatible server) to the Lambforge chat as a local AI runner (outbound connection only - works behind NAT, nothing is exposed)

Options:
  -n, --name <name>          Runner name shown in the chat model picker
                             (default: hostname)
  -t, --token <token>        Runner token from Profile -> Local AI runners
                             (instead of `gcli login`)
  --ollama <url>             Ollama URL (default: $OLLAMA_HOST or
                             http://127.0.0.1:11434)
  --backend <name=kind:url>  Model server to serve from, repeatable; kinds:
                             ollama, openai (Strata, llama-server, LM Studio,
                             vLLM). E.g. --backend
                             strata=openai:http://127.0.0.1:8080. With
                             --ollama, Ollama comes first
  --backend-key <name=key>   API key for a backend, repeatable (default:
                             $<NAME>_API_KEY, e.g. $STRATA_API_KEY)
  --wsUrl <url>              Lambforge subscriptions endpoint override
  --reset                    Forget the saved runner and register a new one
  -h, --help                 display help for command
i  
   --- Subcommand: runner:daemon:install ---
Usage: gcli runner:daemon:install|runner:start:daemon [options]

Run the runner in the background as a systemd user service: starts with your session, restarts on failure (Linux)

Options:
  -n, --name <name>          Runner name when registering (default: hostname)
  -t, --token <token>        Runner token for a machine without `gcli login`
  --ollama <url>             Ollama URL (default: $OLLAMA_HOST or
                             http://127.0.0.1:11434)
  --backend <name=kind:url>  Model server to serve from, repeatable; kinds:
                             ollama, openai (Strata, llama-server, LM Studio,
                             vLLM). E.g. --backend
                             strata=openai:http://127.0.0.1:8080. With
                             --ollama, Ollama comes first
  --backend-key <name=key>   API key for a backend, repeatable (default:
                             $<NAME>_API_KEY, e.g. $STRATA_API_KEY)
  --wsUrl <url>              Lambforge subscriptions endpoint override
  --reset                    Forget the saved runner and register a new one
  --service <name>           systemd unit name (default: lambforge-runner)
  --dry-run                  Print the unit file instead of installing it
  -h, --help                 display help for command
i  
   --- Subcommand: runner:daemon:status ---
Usage: gcli runner:daemon:status [options]

Show the runner service status (systemctl --user status)

Options:
  --service <name>  systemd unit name (default: lambforge-runner)
  -h, --help        display help for command
i  
   --- Subcommand: runner:daemon:start ---
Usage: gcli runner:daemon:start [options]

Start the installed runner service, and report whether it stays up

Options:
  --service <name>  systemd unit name (default: lambforge-runner)
  -h, --help        display help for command
i  
   --- Subcommand: runner:daemon:stop ---
Usage: gcli runner:daemon:stop [options]

Stop the runner service (it stays installed and starts at your next login)

Options:
  --service <name>  systemd unit name (default: lambforge-runner)
  -h, --help        display help for command
i  
   --- Subcommand: runner:daemon:restart ---
Usage: gcli runner:daemon:restart [options]

Restart the runner service (e.g. after `gcli login` to another server)

Options:
  --service <name>  systemd unit name (default: lambforge-runner)
  -h, --help        display help for command
i  
   --- Subcommand: runner:daemon:logs ---
Usage: gcli runner:daemon:logs [options]

Follow the runner service log (journalctl --user -f)

Options:
  --service <name>  systemd unit name (default: lambforge-runner)
  --lines <n>       Lines of history to show first (default 50)
  -h, --help        display help for command
i  
   --- Subcommand: runner:daemon:uninstall ---
Usage: gcli runner:daemon:uninstall [options]

Stop and remove the runner service (the runner stays registered)

Options:
  --service <name>  systemd unit name (default: lambforge-runner)
  -h, --help        display help for command
i  
   --- Subcommand: runner:list ---
Usage: gcli runner:list [options]

List your local AI runners and the models they serve

Options:
  -h, --help  display help for command
i  
   --- Subcommand: runner:models ---
Usage: gcli runner:models [options]

Choose which of a runner's models appear in the chat model picker (no flags: list them)

Options:
  --id <id>        Runner id (default: the runner saved on this machine)
  --show <models>  Comma-separated models to show (hides the rest)
  --all            Show every model again
  --none           Hide all models of this runner from the chat
  -h, --help       display help for command
i  
   --- Subcommand: runner:delete ---
Usage: gcli runner:delete [options]

Delete a local AI runner and revoke its token

Options:
  --id <id>   Runner id (default: the runner saved on this machine)
  -h, --help  display help for command
i  
   --- Subcommand: workspace:start ---
Usage: gcli workspace:start [options]

Connect the current directory to the Lambforge chat as a local workspace: the AI agents can read/edit its files and run commands here (outbound connection only - works behind NAT)

Options:
  -n, --name <name>          Workspace name shown in the chat (default:
                             directory name)
  -p, --project <projectId>  Project the workspace belongs to (default: `gcli
                             project:use`)
  -t, --token <token>        Workspace token (instead of registering with `gcli
                             login`)
  --allow <commands>         Comma-separated commands that run without
                             approval; * matches anything (e.g. "npm test,npm
                             run *")
  --no-default-allow         Do not pre-allow read-only commands (git
                             status/diff/log, ls, ...)
  --yolo                     Run EVERY command without asking (only in a
                             sandbox / a repo you can reset)
  --no-terminal-approval     Approve commands only in the chat, never prompt in
                             this terminal
  --env <names>              Comma-separated environment variables to pass to
                             commands (default: a minimal environment)
  --inherit-env              Pass your whole shell environment to commands
  --allow-terminal           Let you open a terminal on this machine from the
                             Lambforge editor
  --allow-secrets            Let the chat read/write .env files, keys and other
                             secrets files
  --wsUrl <url>              Lambforge subscriptions endpoint override
  --reset                    Forget the workspace saved for this directory and
                             register a new one
  -h, --help                 display help for command
i  
   --- Subcommand: workspace:list ---
Usage: gcli workspace:list [options]

List your local workspaces (online status, directory, processes)

Options:
  -p, --project <projectId>  Only this project
  -h, --help                 display help for command
i  
   --- Subcommand: workspace:delete ---
Usage: gcli workspace:delete [options]

Delete a local workspace and revoke its token (default: the one registered for this directory)

Options:
  --id <id>   Workspace id (see `gcli workspace:list`)
  -h, --help  display help for command
i  
   --- Subcommand: workflow:list ---
Usage: gcli workflow:list [options]

List the project workflows

Options:
  -p, --project <project>
  -h, --help               display help for command
i  
   --- Subcommand: workflow:get ---
Usage: gcli workflow:get [options]

Print a workflow as YAML (the format workflow:apply reads), or write it with -o

Options:
  -p, --project <project>
  -n, --name <name>        Workflow name
  -o, --out <file>         Write the YAML to this file
  -h, --help               display help for command
i  
   --- Subcommand: workflow:generate ---
Usage: gcli workflow:generate [options]

Draft a workflow with AI from plain language (or change one with --name / --from). Prints or writes YAML; saves only with --apply

Options:
  -p, --project <project>
  -d, --description <text>  What the workflow should do, e.g. "charge the card
                            with retries, then email the receipt"
  -n, --name <name>         Workflow name: an existing one is changed, a new
                            one is named so
  --from <file>             Change this workflow file instead
  -o, --out <file>          Write the draft YAML to this file
  --apply                   Save the draft as the workflow (needs a name)
  -h, --help                display help for command
i  
   --- Subcommand: workflow:apply ---
Usage: gcli workflow:apply [options]

Create or update a workflow from a YAML/JSON file (workflow: {name, description, definition})

Options:
  -p, --project <project>
  -f, --file <file>         Workflow file
  -n, --name <name>         Overrides workflow.name from the file
  -d, --description <text>  Overrides workflow.description
  -h, --help                display help for command
i  
   --- Subcommand: workflow:validate ---
Usage: gcli workflow:validate [options]

Check a workflow file against the cluster (lambdas exist, graph is valid)

Options:
  -p, --project <project>
  -f, --file <file>        Workflow file
  -h, --help               display help for command
i  
   --- Subcommand: workflow:delete ---
Usage: gcli workflow:delete [options]

Delete a workflow and all of its runs

Options:
  -p, --project <project>
  -n, --name <name>        Workflow name
  -h, --help               display help for command
i  
   --- Subcommand: workflow:run ---
Usage: gcli workflow:run [options]

Start a run; the JSON input is the first step request body. --wait follows it to the end

Options:
  -p, --project <project>
  -n, --name <name>        Workflow name
  -i, --input <json>       Run input as JSON (default {})
  --input-file <file>      Read the run input from a JSON file
  -w, --wait               Print each step as it happens until the run ends
  -h, --help               display help for command
i  
   --- Subcommand: workflow:runs ---
Usage: gcli workflow:runs [options]

List a workflow runs, newest first

Options:
  -p, --project <project>
  -n, --name <name>        Workflow name
  -l, --limit <limit>      How many (default 50)
  -h, --help               display help for command
i  
   --- Subcommand: workflow:status ---
Usage: gcli workflow:status [options]

Show a run: its step events, error and output (--follow until it ends)

Options:
  -p, --project <project>
  -n, --name <name>        Workflow name
  -r, --run <run>          Run name (see workflow:runs)
  -f, --follow             Keep printing events until the run ends
  -h, --help               display help for command
i  
   --- Subcommand: workflow:cancel ---
Usage: gcli workflow:cancel [options]

Cancel a running run

Options:
  -p, --project <project>
  -n, --name <name>        Workflow name
  -r, --run <run>          Run name (see workflow:runs)
  -h, --help               display help for command
i  
   --- Subcommand: workflow:trigger:add ---
Usage: gcli workflow:trigger:add [options]

Start runs from an HTTP URL (--http; the JSON body is the input) or a schedule (--cron). Needs runtime 1.26+ on the cluster

Options:
  -p, --project <project>
  -n, --name <name>        Workflow name
  --http                   An HTTP trigger: <router>/<project>/workflows/<path>
  --path <path>            HTTP path under /workflows/ (default: the workflow
                           name)
  --method <methods>       HTTP methods, comma separated (default POST)
  --cron <schedule>        A schedule: "@every 1h", "0 9 * * 1-5", "@daily"
                           (UTC)
  -i, --input <json>       Schedule: the input of every run (default {})
  --input-file <file>      Schedule: read the run input from a JSON file
  -h, --help               display help for command
i  
   --- Subcommand: workflow:trigger:list ---
Usage: gcli workflow:trigger:list [options]

List a workflow HTTP and schedule triggers

Options:
  -p, --project <project>
  -n, --name <name>        Workflow name
  -h, --help               display help for command
i  
   --- Subcommand: workflow:trigger:remove ---
Usage: gcli workflow:trigger:remove [options]

Remove a workflow trigger

Options:
  -p, --project <project>
  -n, --name <name>        Workflow name
  -t, --trigger <trigger>  Trigger id, path or schedule (see
                           workflow:trigger:list)
  -h, --help               display help for command
i  
   --- Subcommand: domain:list ---
Usage: gcli domain:list [options]

List the domains and platform names of a project

Options:
  -p, --project <project>
  -h, --help               display help for command
i  
   --- Subcommand: domain:apply ---
Usage: gcli domain:apply [options]

Claim, add and route the domains listed under domains: in lambforge.yaml

Options:
  -p, --project <project>
  -spec, --spec <spec>
  -h, --help               display help for command
i  
   --- Subcommand: validate ---
Usage: gcli validate [options] [path]

Check every lambforge.yaml of the repository (unknown keys, wrong types, clashing names); --online also against the live platform API

Options:
  --online    Compare function / environment keys with the live API
  -h, --help  display help for command
i  
   --- Subcommand: plan ---
Usage: gcli plan [options] [path]

Compare every lambforge.yaml of the repository with what runs in the project: in sync, will change, missing, unmanaged

Options:
  -p, --project <project>
  --exit-code              Exit 2 when something would change, 1 on errors (for
                           CI)
  --json                   Machine-readable output
  -h, --help               display help for command
i  
   --- Subcommand: apply ---
Usage: gcli apply [options] [path]

Make every lambforge.yaml of the repository true: shows the plan, asks, then creates / updates environments, lambdas (waiting for each build), time + queue triggers and domains. Never deletes.

Options:
  -p, --project <project>
  -y, --yes                Apply without asking (CI)
  --code                   Also redeploy lambdas whose settings are in sync
                           (code changes are not detected yet)
  --only <lambda>          Only the lambforge.yaml of this lambda (or folder)
  -h, --help               display help for command
i  
   --- Subcommand: export ---
Usage: gcli export [options] <lambda>

Generate a lambforge.yaml from a running lambda (function, environment, time trigger, domains) - secret and config names only

Options:
  -p, --project <project>
  -o, --output <file>      Write to a file instead of stdout
  -h, --help               display help for command
i  
   --- Subcommand: lambda:resources ---
Usage: gcli lambda:resources [options]

What each lambda really uses next to what it reserves, and the right-sized CPU / memory (raise / lower / keep, cost now vs recommended); --auto keeps one sized automatically

Options:
  -p, --project <project>
  -n, --name <name>        One lambda
  --days <days>            Measurement window, 1-8 days (default 7)
  --auto                   With --name: the platform applies the recommendation
                           itself (a day of data, within the plan, at most once
                           a day, you are notified)
  --fixed                  With --name: recommendations only (the default)
  --json                   Print the rows as JSON
  -h, --help               display help for command
i  
   --- Subcommand: plugin:resources ---
Usage: gcli plugin:resources [options]

What each installed plugin (Redis, MongoDB, NATS, ...) really uses per instance, and the right-sized CPU / memory; --apply sets it

Options:
  -p, --project <project>
  -n, --name <name>        One plugin, e.g. redis-plugin
  --days <days>            Measurement window, 1-8 days (default 7)
  --apply                  With --name: reserve the recommended CPU / memory
                           (limits kept; instances restart one at a time)
  --json                   Print the rows as JSON
  -h, --help               display help for command
i  
   --- Subcommand: plugin:auto-grow ---
Usage: gcli plugin:auto-grow [options] <plugin>

Whether the plugin's volume grows to the next size by itself at 90 % full (on by default) or only warns

Options:
  -p, --project <project>
  --on                           Grow by itself
  --off                          Only warn at 80 % / 90 %
  -cid, --clusterId <clusterId>  Which installation, when the plugin is on
                                 several clusters (omit for the shared cluster)
  -h, --help                     display help for command
i  
   --- Subcommand: sleep-schedule:list ---
Usage: gcli sleep-schedule:list [options]

The project's sleep schedules: hours, days, time zone, paused, state and the lambdas following each (scaleOptions.sleepSchedule)

Options:
  -p, --project <project>
  --json                   Print as JSON
  -h, --help               display help for command
i  
   --- Subcommand: sleep-schedule:set ---
Usage: gcli sleep-schedule:set [options] <name>

Create or change a named sleep schedule (only the flags given change; applies at once). Outside its hours the lambdas following it scale to 0 (plugins keep running)

Options:
  -p, --project <project>
  --json                   Print as JSON
  --days <days>            Working days: mon-fri, 1-5, sat,sun ... (0 = Sunday)
  --wake <HH:MM>           Working hours start
  --sleep <HH:MM>          Working hours end
  --timezone <tz>          IANA time zone, e.g. Europe/Sofia
  --pause                  Pause it: its lambdas stay awake
  --resume                 Resume a paused schedule
  -h, --help               display help for command
i  
   --- Subcommand: sleep-schedule:delete ---
Usage: gcli sleep-schedule:delete [options] <name>

Delete a sleep schedule (refused while lambdas follow it - change their scaleOptions.sleepSchedule first)

Options:
  -p, --project <project>
  --json                   Print as JSON
  -h, --help               display help for command
i  
   --- Subcommand: sleep-schedule:sleep ---
Usage: gcli sleep-schedule:sleep [options] <name>

Put the schedule's lambdas to sleep now, until its next wake time

Options:
  -p, --project <project>
  --json                   Print as JSON
  -h, --help               display help for command
i  
   --- Subcommand: sleep-schedule:wake ---
Usage: gcli sleep-schedule:wake [options] <name>

Wake the schedule's lambdas now, until its next sleep time

Options:
  -p, --project <project>
  --json                   Print as JSON
  -h, --help               display help for command
i  
   --- Subcommand: project:savings ---
Usage: gcli project:savings [options]

What the platform saved this month: fewer / cheaper machines, hours asleep, lambdas sized down automatically

Options:
  -p, --project <project>
  --json                   Print as JSON
  -h, --help               display help for command
i  
   --- Subcommand: cluster:pod-placement ---
Usage: gcli cluster:pod-placement [options]

How a Talos cluster's scheduler places new pods: spread (emptiest machine) or fill (pack machines, so the autoscaler can remove empty ones). Changed live, no reboot

Options:
  -p, --project <project>
  -c, --cluster <cluster>      Cluster id (see cluster:list)
  --clusterName <clusterName>  Cluster name instead of --cluster
  --mode <mode>                spread | fill
  -h, --help                   display help for command
