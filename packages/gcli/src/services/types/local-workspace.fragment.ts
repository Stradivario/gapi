export const LocalWorkspaceFragment = `
  id
  name
  projectId
  tokenPrefix
  root
  hostname
  gitBranch
  online
  lastSeenAt
  createdAt
  policy {
    mode
    allow
  }
  processes {
    id
    name
    command
    status
  }
`;
