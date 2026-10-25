export const WorkflowFragment = `
id
projectId
clusterId
name
description
definition
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
