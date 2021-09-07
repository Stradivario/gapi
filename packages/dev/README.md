### Login

```bash
gcli login --token 'GRAPHQL_TOKEN' --key 'GOOGLE_API_KEY' --url http://localhost:9004/graphql
```

### List Projects

```bash
gcli project:list
```

### List Lambdas for project

```bash
gcli lambda:list --project 'PROJECT_ID'
```

### Get Lambda
```bash
gcli lambda:get --lambda 'LAMBDA_ID'
```