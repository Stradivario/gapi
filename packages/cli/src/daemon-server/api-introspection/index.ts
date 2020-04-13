/* eslint-disable @typescript-eslint/no-explicit-any */
// tslint:disable
// graphql typescript definitions

export interface IGraphQLResponseRoot {
  data?: IQuery | IMutation | ISubscription;
  errors?: Array<IGraphQLResponseError>;
}

export interface IGraphQLResponseError {
  message: string; // Required for all errors
  locations?: Array<IGraphQLResponseErrorLocation>;
  [propName: string]: any; // 7.2.2 says 'GraphQL servers may provide additional entries to error'
}

export interface IGraphQLResponseErrorLocation {
  line: number;
  column: number;
}

/**
    description: Query type for all get requests which will not change persistent data
  */
export interface IQuery {
  __typename?: 'Query';
  status: IStatusQueryType | null;
  getLinkList: Array<ILinkListType> | null;
}

export interface IStatusQueryType {
  __typename?: 'StatusQueryType';
  status: string | null;
}

export interface ILinkListType {
  __typename?: 'LinkListType';
  repoPath: string | null;
  introspectionPath: string | null;
  linkName: string | null;
  serverMetadata: IServerMetadataType | null;
}

export interface IServerMetadataType {
  __typename?: 'ServerMetadataType';
  port: number | null;
}

/**
    description: Mutation type for all requests which will change persistent data
  */
export interface IMutation {
  __typename?: 'Mutation';
  notifyDaemon: ILinkListType | null;
}

export interface IServerMetadataInputType {
  port?: number | null;
}

/**
    description: Subscription type for all subscriptions via pub sub
  */
export interface ISubscription {
  __typename?: 'Subscription';
  statusSubscription: ILinkListType | null;
}

// tslint:enable
