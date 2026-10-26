export const WorkflowFragment = `
id
projectId
clusterId
name
description
definition
triggers {
  id
  kind
  resourceName
  path
  methods
  cron
  input
  url
  createdAt
}
createdAt
updatedAt
`;

export const WorkflowRunFragment = `
name
workflow
phase
input
output
startedAt
finishedAt
activeStates
errorType
cause
triggerKind
triggerName
`;

export const WorkflowRunDetailsFragment = `
${WorkflowRunFragment}
events {
  seq
  at
  type
  state
  attempt
}
`;
