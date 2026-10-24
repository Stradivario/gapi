export interface LocalWorkspace {
  id: string;
  name: string;
  projectId?: string;
  tokenPrefix?: string;
  root?: string;
  hostname?: string;
  gitBranch?: string;
  online?: boolean;
  lastSeenAt?: string;
  createdAt?: string;
  policy?: { mode?: string; allow?: string[] };
  processes?: {
    id: string;
    name?: string;
    command?: string;
    status?: string;
  }[];
}

/** One registered directory in ~/.graphql-server/workspaces.json. */
export interface SavedWorkspace {
  id: string;
  name: string;
  token: string;
  projectId: string;
  root: string;
  wsUrl?: string;
}
