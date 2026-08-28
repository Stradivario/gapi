export const PluginFragment = `
id
name
description
documentation
logo
pluginType
isActive
configSchema
`;

export const InstalledPluginFragment = `
plugin {
  ${PluginFragment}
}
installedAt
config
clusterId
clusterName
`;
