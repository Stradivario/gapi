export const EnvironmentFragment = `
id
name
projectId
image
builder
poolSize
minCpu
maxCpu
minMemory
maxMemory
region
clusterId
clusterName
health {
  readiness { http tcp failAfter }
  liveness { http tcp failAfter }
}
`;
