export const ClusterFragment = `
id
projectId
name
status
provider
region
serverType
imageId
topology {
  workers
  singleNode
}
endpoint
routerUrl
withLoadBalancer
loadBalancerIp
error
`;
