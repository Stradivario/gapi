### Installation

```bash
curl -L "https://github.com/Stradivario/gapi/raw/master/packages/gcli/release/gcli-linux" -o ~/.local/bin/gcli
```

```bash
chmod +x ~/.local/bin/gcli
```

#### Using NPM

```bash
npm i -g @gapi/gcli
```

### Login

```bash
gcli login --token 'GRAPHQL_TOKEN' --key 'GOOGLE_API_KEY' --url 'URL' --uploadUrl 'UPLOAD_URL
```

### List Projects

```bash
gcli project:list
```

### use existing project

```bash
gcli use 'PROJECT_ID'
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
gcli lambda:create --name pesho --route pesho --code 'module.exports = async (context) => ({ status: 200, body: "Hello, world!", headers: { "Access-Control-Allow-Origin": "https://graphql-server.com"}})'
```

##### Or from files

```bash
gcli lambda:create --name pesho --route pesho --file ./index.ts --script ./bash.sh --package ./package.json
```

#### Or from `spec`

```bash
gcli lambda:create --spec spec.json
```

#### If `spec` already present

```bash
gcli lambda:create
```

example spec.json

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

#### Updating Lambda

```bash
gcli lambda:update
```

#### Delete Lambda

```bash
gcli lambda:delete
```

#### Get Lambda

```bash
gcli lambda:get
```

#### Testing lambda

```bash
gcli lambda:test --queryParams '?test=1&proba=1&dada=5' --pathParams 'proba=5;test=7'
```

#### Default long lived token for CI/CD using github actions

Can be set using environment variable called `GCLI_AUTH_TOKEN`

```
export GCLI_AUTH_TOKEN='my-generated-token'
```