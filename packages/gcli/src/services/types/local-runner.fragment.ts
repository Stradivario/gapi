export const LocalRunnerFragment = `
  id
  name
  tokenPrefix
  online
  lastSeenAt
  runnerVersion
  createdAt
  enabledModels
  models {
    name
    parameterSize
    quantization
    capabilities
  }
`;
