export const LambdaFragment = `
id
projectId
name
url
route
code
params
secrets {
 id
 projectId
 name
 apiVersion
 data
 kind
 metadata {
  creationTimestamp
  name
  namespace
  resourceVersion
  uid
 }
 type
}
configs {
 id
 projectId
 name
 apiVersion
 data
 kind
 metadata {
  creationTimestamp
  name
  namespace
  resourceVersion
  uid
 }
 type
}
env
method
createdBy
createdAt
updatedAt
packageJson
buildBashScript
customUploadFileId
federation
subgraphs
mcp
mcpGraph
mcpOperations {
  name
  query
}
mcpHeaders {
  name
  value
}
mcpForwardHeaders {
  name
}
envSecrets
scaleOptions {
  minCpu
  maxCpu
  minMemory
  maxMemory
  minScale
  maxScale
  targetCpu
  executorType
  idleTimeout
  concurrency
  functionTimeout
  specializationTimeout
}
`;
