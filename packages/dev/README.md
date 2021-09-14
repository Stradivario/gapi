### Login

```bash
gcli login --token 'GRAPHQL_TOKEN' --key 'GOOGLE_API_KEY' --url http://localhost:9004/graphql
```

### List Projects

```bash
gcli project:list
```

### use existing project

```bash
gcli use --project 'PROJECT_ID'
```

### List Lambdas for project

```bash
gcli lambda:list
```

or

```bash
gcli lambda:list --project 'PROJECT_ID'
```

### Get Lambda

```bash
gcli lambda:get --lambda 'LAMBDA_ID'
```

##### By name

```bash
gcli lambda:get --name 'MY_LAMBDA_NAME'
```

### Create Lambda

```bash
gcli lambda:create --name pesho --route pesho --code 'module.exports = async (context) => ({ status: 200, body: "Hello, 22world!", headers: { "Access-Control-Allow-Origin": "https://graphql-server.com"}})'
```

##### Or from files

```bash
gcli lambda:create --name pesho --route pesho --file ./index.ts --script ./bash.sh --package ./package.json
```

#### Or from `spec`

```bash
gcli lambda:create --spec spec.json
```

spec.json

```json
{
  "name": "pesho",
  "route": "pesho",
  "file": "index.ts",
  "script": "bash.sh",
  "package": "package.json",
  "params": ["test", "proba"],
  "config": "",
  "secret": "",
  "env": "NODEJS",
  "method": "GET"
}
```

#### Testing lambda

```bash
gcli lambda:test --queryParams '?test=1&proba=1&dada=5' --pathParams 'proba=5;test=7'
```
