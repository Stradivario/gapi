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
config {
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
