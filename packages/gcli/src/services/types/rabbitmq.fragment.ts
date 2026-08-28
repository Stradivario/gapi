export const RabbitMqFragment = `
id
name
description
projectId
region
storage {
  enabled
  size
}
clusterId
clusterName
queues {
  id
  name
  vhost
  durable
  auto_delete
}
`;
