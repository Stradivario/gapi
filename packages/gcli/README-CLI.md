Usage: gcli [options] [command]

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  login [options]               Login to graphql-server
  lambda:list [options]         List of all lambdas for project
  lambda:get [options]          Get lambda by id
  lambda:create [options]
  lambda:update [options]
  lambda:delete [options]       Get lambda by id
  lambda:log [options]          Get lambda log
  lambda:build:log [options]    Get build log
  lambda:test [options]         Test lambda
  project:list                  List of all projects
  project:use <project>         Adds default project to be used all around the
                                CLI
  project:clear                 Clears default project to be used all around
                                the CLI
  build [options]               Build bundle using esbuild
                                https://esbuild.github.io
  environment:list [options]    List of all environments for project
  environment:create [options]  Create environment for project
  environment:update [options]  Update environment for project
  environment:delete [options]  Delete environment for project
  environment:get [options]     Get environment for project
  mcp:start [options]           Start mcp proxy server
  start [options]               Start bundle using esbuild
                                https://esbuild.github.io
  help [command]                display help for command
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
  -p, --project <project>  Specify custom token generated from the website
  -h, --help               display help for command
[36m
--- Subcommand: lambda:get ---[0m
Usage: gcli lambda:get [options]

Get lambda by id

Options:
  -l, --lambda <lambda>    get by lambda id
  -n, --name <name>        get by lambda name
  -p, --project <project>  get by lambda name
  -p, --spec <spec>        get by lambda name
  -h, --help               display help for command
[36m
--- Subcommand: lambda:create ---[0m
Usage: gcli lambda:create [options]

Options:
  --name <name>                                    Function name
  --project <project>                              Project in which this lambda is defined
  --env <env>                                      Environment name for function can be NODEJS
  --method <method...>                             HTTP Methods: GET,POST,PUT,DELETE,HEAD. To mention single method
  --spec <spec>                                    Spec file yml or json path
  --packageJson <packageJson>                      Define packageJson in string format
  --package <package>                              Path to package.json
  --buildBashScript <buildBashScript>              Package build command for builder to run with
  --script <script>                                Package build script path
  --params <params>                                Array from strings which defines route params
  --network <network>                              Can be private or public meaning exposed to the router or just for private available can be both also --network private --network public
  --route <route>                                  Lambda route in which will be accessible
  --code <code>                                    URL or local path for single file source code
  --file <file>                                    Main lambda file
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
  --method <method...>                             HTTP Methods: GET,POST,PUT,DELETE,HEAD. To mention single method
  --spec <spec>                                    Spec file yml or json path
  --packageJson <packageJson>                      Define packageJson in string format
  --package <package>                              Path to package.json
  --buildBashScript <buildBashScript>              Package build command for builder to run with
  --script <script>                                Package build script path
  --params <params>                                Array from strings which defines route params
  --network <network>                              Can be private or public meaning exposed to the router or just for private available can be both also --network private --network public
  --route <route>                                  Lambda route in which will be accessible
  --code <code>                                    URL or local path for single file source code
  --file <file>                                    Main lambda file
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
  -n, --name <name>        get by lambda name
  -p, --project <project>  get by lambda name
  -s, --spec <spec>        get by lambda name
  -h, --help               display help for command
[36m
--- Subcommand: lambda:log ---[0m
Usage: gcli lambda:log [options]

Get lambda log

Options:
  -l, --lambda <lambda>    get by lambda id
  -n, --name <name>        get by lambda name
  -p, --project <project>  get by lambda name
  -s, --spec <spec>        get by lambda name
  -h, --help               display help for command
[36m
--- Subcommand: lambda:build:log ---[0m
Usage: gcli lambda:build:log [options]

Get build log

Options:
  -l, --lambda <lambda>    get by lambda id
  -n, --name <name>        get by lambda name
  -p, --project <project>  get by lambda project
  -s, --spec <spec>        use configuration
  -h, --help               display help for command
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
  -h, --help                        display help for command
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
  -h, --help               display help for command
[36m
--- Subcommand: environment:get ---[0m
Usage: gcli environment:get [options]

Get environment for project

Options:
  -p, --project <project>
  -n, --name <name>
  -h, --help               display help for command
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
  -e, --external <external...>  External libraries
  -h, --help                    display help for command
