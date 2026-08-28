/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
 // tslint:disable
// graphql typescript definitions


  export interface IGraphQLResponseRoot {
    data?: IQuery | IMutation;
    errors?: Array<IGraphQLResponseError>;
  }

  export interface IGraphQLResponseError {
    message: string;            // Required for all errors
    locations?: Array<IGraphQLResponseErrorLocation>;
    [propName: string]: any;    // 7.2.2 says 'GraphQL servers may provide additional entries to error'
  }

  export interface IGraphQLResponseErrorLocation {
    line: number;
    column: number;
  }

  
  export interface IQuery {
    __typename?: "Query";
    getRevolutOrders?: IRevolutPaginationType | null;
    getProjectUserScope?: Array<IProjectPermissionType> | null;
    getCard?: ICardType | null;
    listCards?: Array<ICardType> | null;
    listBoardCards?: Array<ICardType> | null;
    getBoardColumn?: IBoardColumnType | null;
    listBoardColumns?: Array<IBoardColumnType> | null;
    generateReport?: IGraphqlFile | null;
    getBoard?: IBoardType | null;
    listBoards?: Array<IBoardType> | null;
    listProjectBacklog?: Array<IBoardType> | null;
    listTokens?: Array<ICiTokensType> | null;
    listProjects?: Array<IProjectType> | null;
    getProject?: IProjectType | null;
    getProjectBoards?: Array<IBoardType> | null;
    getProjectStatistics?: IProjectStatisticsType | null;
    listProjectTiers?: Array<IProjectTierType> | null;
    getUser?: IUserType | null;
    listUsers?: Array<IUserType> | null;
    getUserById?: IUserType | null;
    findUser?: IUserType | null;
    me?: IUserType | null;
    listTeams?: Array<ITeamType> | null;
    getTeam?: ITeamType | null;
    getMyTeams?: Array<ITeamType> | null;
    getAllSessions?: Array<ISessionType> | null;
    getSessions?: Array<ISessionType> | null;
    getNotifications?: INotificationPagination | null;
    listLinodes?: ILinodeInstanceType | null;
    deleteStackScript?: IStackscriptType | null;
    listStackScripts?: IListStackScriptsType | null;
    findStackScripts?: IStackscriptType | null;
    getMachines?: Array<IMachine> | null;
    findMachineByIp?: IMachine | null;
    getSubscribers?: Array<ISubscribeNewsLetter> | null;
    getFeatureFlags?: Array<IFeatureFlag> | null;
    getFeatureFlag?: IFeatureFlag | null;
    listInstances?: IInstanceType | null;
    getInstance?: IInstanceType | null;
    getAiUsageSummary?: IAiUsageSummary | null;
    listRepositories?: Array<IRepositoriesType> | null;
    getLastTemperature?: IIotTemperatureSensorData | null;
    getTemperatureHistory?: IIotTemperatureDeviceArray | null;
    getSensorDateRanges?: Array<string> | null;
    listDevices?: Array<IIotDeviceType> | null;
    listFlows?: Array<IIotFlowType> | null;
    getFlow?: IIotFlowType | null;
    /**
    description?: PRIMARY KNOWLEDGE SEARCH TOOL.
          Use this for ANY question about 'Who', 'What', 'Where', 'Ownership', or 'Concepts' stored in the system.
          It uses Vector Search + GraphRAG to find nodes AND their relationships (e.g. "Who owns X").
          Finds?: Companies, Websites, Code, Concepts, and their connections.
          
  */
    search_knowledge_vector?: any | null;
    /**
    description?: Search THIS PROJECT'S saved memory/knowledge (Vector + GraphRAG).
          Use for anything the user or their team saved to project memory?:
          project-specific preferences, decisions, snippets and facts.
          ALWAYS pass the projectId from your context. This complements
          search_knowledge_vector, which searches the GLOBAL built-in docs.
  */
    search_project_memory?: any | null;
    /**
    description?: List ALL saved memory entries for THIS PROJECT (newest first),
          each with its 'id', 'label' and properties. Use this to show the user
          their project memory, or to find the 'id' of an entry you then want to
          edit with update_project_memory or remove with delete_project_memory.
  */
    list_project_memory?: any | null;
    /**
    description?: Search the knowledge graph. You can provide either a plain-text query (e.g. "Lambda environment configurations") or a Cypher query. For plain text, it searches across node name, content, description, and text fields.

  Schema?:
  (?:User {idString})
  (?:Chat {idString, createdAtNumber})
  (?:Message {idString, roleString, contentString, createdAtNumber})
  (User)-[?:OWNS]->(Chat)
  (Chat)-[?:HAS_MESSAGE]->(Message)
  (Message)-[?:NEXT]->(Message)

  AND Dynamic Knowledge Nodes created via add_knowledge?:
  (?:Concept {name, id}), (?:Fact {name, id}), (?:Entity {name, id}), (?:Company {name, id}), etc.
  Relationships are dynamic.
  Use plain text to search, or a Cypher query for advanced queries.
  
  */
    search_graph?: any | null;
    listDocumentation?: Array<IDocumentationNode> | null;
    listAvailableModels?: Array<IAvailableModels> | null;
    listAllowedModels?: Array<IAvailableModels> | null;
    listChats?: Array<IChat> | null;
    listChatsPerProject?: Array<IChat> | null;
    listChatMessages?: Array<IChatMessage> | null;
    getChat?: IChat | null;
    getChatByProjectId?: IChat | null;
    listMcpTools?: Array<IMcpTool> | null;
    listAgents?: Array<IAgent> | null;
    listAgentTypes?: Array<IAgentTypeInfo> | null;
    getAgent?: IAgent | null;
    getAgentTask?: IAgentTask | null;
    listAgentTasks?: Array<IAgentTask> | null;
    stripeConfiguration?: IStripeConfiguration | null;
    paymentMethods?: IPaymentMethodResponse | null;
    getLambdaEditors?: Array<IUserType> | null;
    listMigrations?: Array<IMigrationType> | null;
    removeMigration?: IMigrationType | null;
    getMigration?: IMigrationType | null;
    migrateStatus?: IProcessGenericType | null;
    listDatabaseBackups?: Array<IAmazonFile> | null;
    findApp?: IAppType | null;
    listEnvironmentsByProjectId?: Array<IFissionEnvironmentType> | null;
    getEnvironment?: IFissionEnvironmentType | null;
    listMessageQueueTriggers?: Array<IMessageQueueTrigger> | null;
    listProjectTimeTriggers?: Array<IFissionTimeTriggerType> | null;
    getLambdaLogs?: IFissionLogsType | null;
    getLambdaLogsByName?: IFissionLogsType | null;
    getLambdaBuilderLogs?: IFissionLogsType | null;
    getLambdaBuilderLogsByName?: IFissionLogsType | null;
    getAvailableLogDates?: Array<IAvailableLogDates> | null;
    getRouterUrl?: IFissionType | null;
    listProjectLambdas?: Array<IFissionType> | null;
    /**
    description?: Introspect a federation graph (by graphName, via the internal router) or an arbitrary GraphQL endpoint (endpointUrl) and generate one candidate MCP operation per root field. Powers the operations browser when configuring an MCP lambda. Provide authToken if the endpoint requires authentication to introspect.
  */
    listGraphOperations?: Array<IGeneratedMcpOperationType> | null;
    listMyLambdas?: Array<IFissionType> | null;
    getLambda?: IFissionType | null;
    getLambdaByName?: IFissionType | null;
    lambdaCodeDocs?: Array<ILambdaDocChunk> | null;
    getConfigMap?: IKubectlConfig | null;
    getConfigMapById?: IKubectlConfig | null;
    listProjectConfigs?: Array<IKubectlConfig> | null;
    getSecretMap?: IKubectlConfig | null;
    getSecretMapById?: IKubectlConfig | null;
    listProjectSecrets?: Array<IKubectlConfig> | null;
    listAtlasConnectors?: Array<IMongoAtlasConnector> | null;
    findRabbitMqInstance?: IRabbitMq | null;
    listQueuesPerProject?: Array<IRabbitMqQueue> | null;
    listRabbitMqInstances?: Array<IRabbitMq> | null;
    getPodsCapacityPerNamespace?: IKubernetesMetrics | null;
    getPodsCapacity?: IKubernetesMetrics | null;
    getResourceQuota?: IKubernetesResourceQuotaList | null;
    getLimitRange?: IKubernetesLimitRangeList | null;
    getPersistentVolumes?: IKubernetesResourceQuotaList | null;
    getFunctionExecutions?: IPrometheusData | null;
    getFunctionColdStarts?: IPrometheusData | null;
    getFunctionStatistics?: ILambdaFunctionStatistics | null;
    getAccumulatedPricing?: Array<ICostEstimateResult> | null;
    getProjectEntitlement?: IProjectEntitlement | null;
    listTierEntitlements?: Array<IProjectEntitlement> | null;
    listProjectOverrides?: Array<IProjectEntitlement> | null;
    getFormByName?: IFormDefinition | null;
    getInvoice?: IInvoice | null;
    listInvoices?: Array<IInvoice> | null;
    listProjectInvoices?: Array<IInvoice> | null;
    podCostBreakdown?: Array<IPodCostBreakdown> | null;
    listAvailablePlugins?: Array<IPlugin> | null;
    getPlugin?: IPlugin | null;
    listInstalledPlugins?: Array<IInstalledPlugin> | null;
    isPluginInstalled?: string | null;
    /** Every live cluster this project has - it may have several (dev/stage/prod, ...). */
    projectClusters?: Array<ICluster> | null;
    /** Raw kubeconfig YAML for one of a project's clusters; only available once 'ready'. */
    clusterKubeconfig?: string | null;
    getAllProjectsSummary?: Array<IProjectSummary> | null;
    getClusterStatistics?: IClusterStatistics | null;
    getResourceLimitAlerts?: Array<IResourceLimitAlert> | null;
    listAllInvoices?: Array<IInvoice> | null;
    listAllUsers?: Array<IUser> | null;
    /**
    description?: Describe this code sandbox. Returns a JSON string with its capabilities, the two code contracts an agent may follow (snippet mode?: async function body + `return`; project mode?: a virtual filesystem of `files` run as ES modules + `export default`), the available host tools, and the enforced resource limits. Call this before executeCode to learn how to format code.
  */
    metadata?: string | null;
    /**
    description?: List the project's deployed lambdas so you can pick one to import. Each item's `source` tells you how importLambda will virtualize it?: 'archive' (a customUploadFileId .zip) or 'code' (its code/packageJson/buildBashScript fields as files). Requires the "s3" persistence backend.
  */
    listLambdas?: Array<ILambdaSummary>;
    /**
    description?: List every persistent workspace directory in a project, most-recently created first — use this to recover a `workdir` name you lost track of (there is no other server-side index). Returns each workdir name + when it was created; then inspect one with listFiles/getFile. Requires workspace persistence to be enabled.
  */
    listWorkdirs?: Array<IWorkdirSummary>;
    /**
    description?: List the files stored in a persistent workspace (path/size/lastModified — no content; use getFile to read one). Requires workspace persistence to be enabled.
  */
    listFiles?: Array<IWorkspaceFile>;
    /**
    description?: Read one file (content included) from a persistent workspace; null when it does not exist. Requires workspace persistence to be enabled.
  */
    getFile?: IWorkspaceFile | null;
    /**
    description?: Bulk read?: the contents of many (or ALL) workspace files in one call — use this instead of repeated getFile when hydrating a whole workspace. Missing paths are skipped. Requires workspace persistence to be enabled.
  */
    getFiles?: Array<IWorkspaceFile>;
    /**
    description?: List the project's published archives (from publishProject), newest first — the deploy history. Retention is two-tier?: the newest few per workspace (WORKSPACE_ARTIFACT_RETENTION, default 4) and at most WORKSPACE_PROJECT_ARTIFACT_RETENTION per project (default 30); archives a lambda deploys from are never pruned. Older entries double as rollback points?: pass an entry's customUploadFileId to the lambda update flow to redeploy that version. Requires the "s3" persistence backend.
  */
    listArtifacts?: Array<IWorkspaceArtifact>;
    /**
    description?: List a project's saved plans (the Documents section), most-recently updated first. Each item's `content` is null — read one with getPlan. Optionally filter by status. Requires the "s3" persistence backend.
  */
    listPlans?: Array<IPlan>;
    /**
    description?: Read one saved plan, markdown `content` included. Scoped to the project. Requires the "s3" persistence backend.
  */
    getPlan?: IPlan | null;
}

  
  export interface IRevolutPaginationType {
    __typename?: "RevolutPaginationType";
    orders?: Array<IRevolutOrderType> | null;
    count?: number | null;
}

  
  export interface IRevolutOrderType {
    __typename?: "RevolutOrderType";
    id?: string | null;
    public_id?: string | null;
    type?: string | null;
    state?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    capture_mode?: string | null;
    order_amount?: IRevolutOrderAmount | null;
    order_outstanding_amount?: IRevolutOrderAmount | null;
}

  
  export interface IRevolutOrderAmount {
    __typename?: "RevolutOrderAmount";
    value?: string | null;
    currency?: string | null;
}

  
  export interface IProjectPermissionType {
    __typename?: "ProjectPermissionType";
    user_id?: string | null;
    projectId?: string | null;
    scope?: Array<IProjectPermissionsEnumEnum> | null;
}

export   
  type IProjectPermissionsEnumEnum = 'CREATE_PROJECT' | 'DELETE_PROJECT' | 'CREATE_SESSION' | 'DELETE_SESSION' | 'STOP_SESSION';

  
  export interface ICardType {
    __typename?: "CardType";
    id?: string | null;
    title?: string | null;
    columnId?: string | null;
    userId?: string | null;
    pullRequest?: string | null;
    user?: IUserType | null;
    column?: IBoardColumnType | null;
    order?: number | null;
    backlogOrder?: number | null;
    boardId?: string | null;
    projectId?: string | null;
    board?: IBoardType | null;
    description?: string | null;
    dueDate?: string | null;
    dueDateComplete?: string | null;
    members?: Array<IUserType> | null;
    sessions?: Array<ISessionType> | null;
    labels?: Array<string> | null;
    comments?: Array<ICardComment> | null;
    files?: Array<IGraphqlFile> | null;
    activity?: ICardRevisionsType | null;
}

  
  export interface IUserType {
    __typename?: "UserType";
    id?: string | null;
    email?: string | null;
    name?: string | null;
    displayName?: string | null;
    tag?: string | null;
    photoURL?: string | null;
    signInMethod?: string | null;
    braintreeId?: string | null;
    additionalUserInfo?: IUserTypeAdditionalInfo | null;
    firebaseUserRecord?: IFirebaseUserType | null;
    user_id?: string | null;
    graphqlServerJson?: string | null;
    createdAt?: string | null;
    vsCodeSyncLocalSettings?: string | null;
    vsCodeSettings?: string | null;
    instances?: Array<IInstanceType> | null;
    machines?: Array<IMachine> | null;
    domains?: Array<IDomainType> | null;
    sessions?: Array<ISessionType> | null;
    cliToken?: string | null;
    type?: string | null;
    cards?: Array<ICardType> | null;
    scopes?: Array<IUserScopeEnum> | null;
}

  
  export interface IUserTypeAdditionalInfo {
    __typename?: "UserTypeAdditionalInfo";
    isNewUser?: boolean | null;
    providerId?: string | null;
    profile?: IUserTypeProfile | null;
    username?: boolean | null;
}

  
  export interface IUserTypeProfile {
    __typename?: "UserTypeProfile";
    avatar_url?: string | null;
    bio?: string | null;
    blog?: string | null;
    company?: string | null;
    created_at?: string | null;
    email?: string | null;
    events_url?: string | null;
    followers?: string | null;
    followers_url?: string | null;
    following?: string | null;
    following_url?: string | null;
    gists_url?: string | null;
    gravatar_id?: string | null;
    hireable?: string | null;
    html_url?: string | null;
    id?: string | null;
    location?: string | null;
    login?: string | null;
    name?: string | null;
    node_id?: string | null;
    organizations_url?: string | null;
    public_gists?: string | null;
    public_repos?: string | null;
    received_events_url?: string | null;
    repos_url?: string | null;
    site_admin?: string | null;
    starred_url?: string | null;
    subscriptions_url?: string | null;
    updated_at?: string | null;
    type?: string | null;
    url?: string | null;
}

  
  export interface IFirebaseUserType {
    __typename?: "FirebaseUserType";
    uid?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    displayName?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
    disabled?: boolean | null;
    metadata?: IFirebaseUserMetadataType | null;
    providerData?: Array<IFirebaseUserInfo> | null;
    tokensValidAfterTime?: string | null;
}

  
  export interface IFirebaseUserMetadataType {
    __typename?: "FirebaseUserMetadataType";
    creationTime?: string | null;
    lastSignInTime?: string | null;
    lastRefreshTime?: string | null;
}

  
  export interface IFirebaseUserInfo {
    __typename?: "FirebaseUserInfo";
    uid?: string | null;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    providerId?: string | null;
    phoneNumber?: string | null;
}

  
  export interface IInstanceType {
    __typename?: "InstanceType";
    id?: string | null;
    uniqueId?: string | null;
    user_id?: string | null;
    ip?: string | null;
    provider?: string | null;
    linode?: ILinodeInstanceType | null;
}

  
  export interface ILinodeInstanceType {
    __typename?: "LinodeInstanceType";
    label?: string | null;
    region?: string | null;
    image?: string | null;
    type?: string | null;
    group?: string | null;
    tags?: Array<string> | null;
    id?: number | null;
    status?: string | null;
    hypervisor?: string | null;
    created?: string | null;
    updated?: string | null;
    ipv4?: Array<string> | null;
    ipv6?: string | null;
    specs?: ILinodeSpecType | null;
    alerts?: ILinodeInstanceAlertType | null;
    backups?: ILinodeInstanceBackupsType | null;
    watchdog_enabled?: boolean | null;
}

  
  export interface ILinodeSpecType {
    __typename?: "LinodeSpecType";
    disk?: number | null;
    memory?: number | null;
    vcpus?: number | null;
    transfer?: number | null;
}

  
  export interface ILinodeInstanceAlertType {
    __typename?: "LinodeInstanceAlertType";
    cpu?: number | null;
    network_in?: number | null;
    network_out?: number | null;
    transfer_quota?: number | null;
    io?: number | null;
}

  
  export interface ILinodeInstanceBackupsType {
    __typename?: "LinodeInstanceBackupsType";
    enabled?: number | null;
    schedule?: ILinodeInstanceBackupsScheduleType | null;
}

  
  export interface ILinodeInstanceBackupsScheduleType {
    __typename?: "LinodeInstanceBackupsScheduleType";
    day?: string | null;
    window?: string | null;
}

  
  export interface IMachine {
    __typename?: "Machine";
    id?: string | null;
    machineHash?: string | null;
    networkInterfaces?: string | null;
    ip?: string | null;
    label?: string | null;
    public?: boolean | null;
    online?: boolean | null;
    networks?: Array<string> | null;
    webSocketKey?: string | null;
    worker_type?: IWorkersEnum | null;
    sessions?: Array<ISessionType> | null;
    instance?: IInstanceType | null;
}

export   
  type IWorkersEnum = 'vscode' | 'runner';

  
  export interface ISessionType {
    __typename?: "SessionType";
    id?: string | null;
    token?: string | null;
    user_id?: string | null;
    user?: IUserType | null;
    projectId?: string | null;
    project?: IProjectType | null;
    /**
    description?: Assigned on user input from UI
  */
    machineLabel?: string | null;
    /**
    description?: Resolved machine based on machineLabel (fake relation)
  */
    machine?: IMachine | null;
    name?: string | null;
    active?: boolean | null;
    port?: number | null;
    url?: string | null;
    cdnUrl?: string | null;
    oUrl?: string | null;
    ports?: Array<string> | null;
    folder?: string | null;
    specifier?: string | null;
    status?: string | null;
    cardId?: string | null;
    card?: ICardType | null;
}

  
  export interface IProjectType {
    __typename?: "ProjectType";
    id?: string | null;
    name?: string | null;
    ownedBy?: string | null;
    createdAt?: any | null;
    hasSSL?: boolean | null;
    url?: string | null;
    sshUrl?: string | null;
    user_id?: string | null;
    owner?: IUserType | null;
    uniqueProjectID?: string | null;
    description?: string | null;
    agentPurpose?: string | null;
    currentUserScope?: Array<string> | null;
    sessions?: Array<ISessionType> | null;
    team?: ITeamType | null;
    members?: Array<IUserType> | null;
    boards?: Array<IBoardType> | null;
    machines?: Array<IMachine> | null;
    repositories?: Array<IRepositoriesType> | null;
    rabbitMqCreated?: boolean | null;
    tierId?: string | null;
    tier?: IProjectTierType | null;
}

  
  export interface ITeamType {
    __typename?: "TeamType";
    id?: string | null;
    name?: string | null;
    user_id?: string | null;
    projects?: Array<IProjectType> | null;
    members?: Array<IUserType> | null;
}

  
  export interface IBoardType {
    __typename?: "BoardType";
    id?: string | null;
    name?: string | null;
    projectId?: string | null;
    restricted?: boolean | null;
    labels?: Array<string> | null;
    project?: IProjectType | null;
    members?: Array<IUserType> | null;
    machines?: Array<IMachine> | null;
    columns?: Array<IBoardColumnType> | null;
}

  
  export interface IBoardColumnType {
    __typename?: "BoardColumnType";
    id?: string | null;
    name?: string | null;
    order?: number | null;
    boardId?: string | null;
    board?: IBoardType | null;
    cards?: Array<ICardType> | null;
}

  
  export interface IRepositoriesType {
    __typename?: "RepositoriesType";
    id?: string | null;
    description?: string | null;
    owner?: string | null;
    name?: string | null;
    url?: string | null;
    sshUrl?: string | null;
    projectId?: string | null;
    project?: IProjectType | null;
}

  
  export interface IProjectTierType {
    __typename?: "ProjectTierType";
    id?: string | null;
    name?: string | null;
    price?: number | null;
    currency?: string | null;
    description?: string | null;
    isDefault?: boolean | null;
    quotas?: IProjectTierQuotasType | null;
    limits?: IProjectTierLimitsType | null;
}

  
  export interface IProjectTierQuotasType {
    __typename?: "ProjectTierQuotasType";
    pods?: string | null;
    services?: string | null;
    configmaps?: string | null;
    secrets?: string | null;
    requestsCpu?: string | null;
    requestsMemory?: string | null;
    limitsCpu?: string | null;
    limitsMemory?: string | null;
}

  
  export interface IProjectTierLimitsType {
    __typename?: "ProjectTierLimitsType";
    container?: IProjectTierContainerLimitsType | null;
}

  
  export interface IProjectTierContainerLimitsType {
    __typename?: "ProjectTierContainerLimitsType";
    maxCpu?: string | null;
    maxMemory?: string | null;
    defaultCpu?: string | null;
    defaultMemory?: string | null;
    defaultRequestCpu?: string | null;
    defaultRequestMemory?: string | null;
}

  
  export interface IDomainType {
    __typename?: "DomainType";
    id?: string | null;
    name?: string | null;
    ip?: string | null;
    port?: string | null;
    sessionId?: string | null;
    session?: ISessionType | null;
    user_id?: string | null;
}

export   
  type IUserScopeEnum = 'CAN_VIEW_PROFILE_SESSIONS' | 'CAN_VIEW_APPS' | 'CAN_LIST_ALL_USERS';

  
  export interface ICardComment {
    __typename?: "CardComment";
    id?: string | null;
    userId?: string | null;
    user?: IUserType | null;
    cardId?: string | null;
    card?: ICardType | null;
    value?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

  
  export interface IGraphqlFile {
    __typename?: "GraphqlFile";
    id?: string | null;
    url?: string | null;
    uploaderId?: string | null;
    uploader?: IUserType | null;
    metadata?: IFileMetadata | null;
    additionalMetadata?: IFileAdditionalMetadata | null;
    amazonMetadata?: IFileAmazonMetadata | null;
}

  
  export interface IFileMetadata {
    __typename?: "FileMetadata";
    fileName?: string | null;
    extension?: string | null;
    size?: string | null;
    type?: string | null;
}

  
  export interface IFileAdditionalMetadata {
    __typename?: "FileAdditionalMetadata";
    cardId?: string | null;
    chatId?: string | null;
    timestamp?: string | null;
    uploaderId?: string | null;
    event?: string | null;
}

  
  export interface IFileAmazonMetadata {
    __typename?: "FileAmazonMetadata";
    Key?: string | null;
    Bucket?: string | null;
}

  
  export interface ICardRevisionsType {
    __typename?: "CardRevisionsType";
    all?: Array<IGraphqlFile> | null;
    update_description?: Array<IGraphqlFile> | null;
    update_duedate?: Array<IGraphqlFile> | null;
    add_label?: Array<IGraphqlFile> | null;
    add_member?: Array<IGraphqlFile> | null;
    remove_label?: Array<IGraphqlFile> | null;
    update_pull_request?: Array<IGraphqlFile> | null;
    update_title?: Array<IGraphqlFile> | null;
    remove_member?: Array<IGraphqlFile> | null;
}

  
  export interface ICiTokensType {
    __typename?: "CiTokensType";
    id?: string | null;
    name?: string | null;
    token?: string | null;
    user_id?: string | null;
    type?: string | null;
    blacklisted?: boolean | null;
    projectId?: string | null;
    project?: IProjectType | null;
}

  
  export interface IProjectStatisticsType {
    __typename?: "ProjectStatisticsType";
    totalCards?: number | null;
    totalBoards?: number | null;
}

export   
  type IGetNotificationsSortEnumEnum = 'ASC' | 'DESC';

  
  export interface INotificationPagination {
    __typename?: "NotificationPagination";
    data?: Array<INotifications> | null;
    count?: number | null;
}

  
  export interface INotifications {
    __typename?: "Notifications";
    id?: string | null;
    read?: boolean | null;
    user_id?: string | null;
    createdAt?: any | null;
    data?: UnionMessagesType | null;
}

export   
  type UnionMessagesType = IProjectNotifications | IMachineNotifications | IQuotaNotifications;



  
  export interface IProjectNotifications {
    __typename?: "ProjectNotifications";
    projectName?: string | null;
    projectId?: string | null;
    message?: ProjectNotificationsDataUnion | null;
}

export   
  type ProjectNotificationsDataUnion = IProjectNotificationsInvite | IProjectNotificationsRemove | IProjectNotificationsMention;



  
  export interface IProjectNotificationsInvite {
    __typename?: "ProjectNotificationsInvite";
    from?: IUserType | null;
}

  
  export interface IProjectNotificationsRemove {
    __typename?: "ProjectNotificationsRemove";
    by?: IUserType | null;
    reason?: string | null;
}

  
  export interface IProjectNotificationsMention {
    __typename?: "ProjectNotificationsMention";
    by?: IUserType | null;
    comment?: ICardComment | null;
}

  
  export interface IMachineNotifications {
    __typename?: "MachineNotifications";
    machineId?: string | null;
    message?: MachineNotificationsDataUnion | null;
}

export   
  type MachineNotificationsDataUnion = IMachineNotificationsStarted | IMachineNotificationsStopped;



  
  export interface IMachineNotificationsStarted {
    __typename?: "MachineNotificationsStarted";
    ip?: string | null;
    worker_type?: string | null;
}

  
  export interface IMachineNotificationsStopped {
    __typename?: "MachineNotificationsStopped";
    ip?: string | null;
    worker_type?: string | null;
}

  
  export interface IQuotaNotifications {
    __typename?: "QuotaNotifications";
    projectName?: string | null;
    projectId?: string | null;
    message?: QuotaNotificationsDataUnion | null;
}

export   
  type QuotaNotificationsDataUnion = IQuotaNotificationsExceeded | IQuotaNotificationsApproaching;



  
  export interface IQuotaNotificationsExceeded {
    __typename?: "QuotaNotificationsExceeded";
    kind?: string | null;
    severity?: string | null;
    resource?: string | null;
    summary?: string | null;
    description?: string | null;
}

  
  export interface IQuotaNotificationsApproaching {
    __typename?: "QuotaNotificationsApproaching";
    resource?: string | null;
    severity?: string | null;
    usedPercent?: string | null;
    summary?: string | null;
    description?: string | null;
}

  
  export interface IStackscriptType {
    __typename?: "StackscriptType";
    id?: number | null;
    username?: string | null;
    user_gravatar_id?: string | null;
    label?: string | null;
    description?: string | null;
    images?: Array<string> | null;
    deployments_total?: number | null;
    deployments_active?: number | null;
    is_public?: boolean | null;
    created?: string | null;
    updated?: string | null;
    rev_note?: string | null;
    script?: string | null;
    user_defined_fields?: string | null;
}

  
  export interface IListStackScriptsType {
    __typename?: "ListStackScriptsType";
    data?: Array<IStackscriptType> | null;
    page?: number | null;
    pages?: number | null;
    results?: number | null;
}

  
  export interface ISubscribeNewsLetter {
    __typename?: "SubscribeNewsLetter";
    email?: string | null;
}

  
  export interface IFeatureFlag {
    __typename?: "FeatureFlag";
    id?: string | null;
    name?: string | null;
    description?: string | null;
    settings?: IFeatureFlagSettings | null;
}

  
  export interface IFeatureFlagSettings {
    __typename?: "FeatureFlagSettings";
    enabled?: boolean | null;
    components?: Array<string> | null;
}

  
  export interface IAiUsageSummary {
    __typename?: "AiUsageSummary";
    projectId?: string | null;
    allowAiChat?: boolean | null;
    allowedAiProviders?: Array<string> | null;
    dailyUsed?: number | null;
    dailyLimit?: number | null;
    weeklyUsed?: number | null;
    weeklyLimit?: number | null;
    monthlyUsed?: number | null;
    monthlyLimit?: number | null;
}

  
  export interface IIotTemperatureSensorData {
    __typename?: "IotTemperatureSensorData";
    createdAt?: string | null;
    raw?: string | null;
    rh?: number | null;
    temp?: number | null;
}

  
  export interface IIotTemperatureDeviceArray {
    __typename?: "IotTemperatureDeviceArray";
    id?: string | null;
    start_date?: string | null;
    data?: Array<IIotTemperatureSensorData> | null;
    serial?: string | null;
}

  
  export interface IIotDeviceType {
    __typename?: "IotDeviceType";
    id?: string | null;
    type?: string | null;
    serial?: string | null;
    ip?: string | null;
    mac?: string | null;
    options?: any | null;
    debug?: boolean | null;
}

  
  export interface IIotFlowType {
    __typename?: "IotFlowType";
    id?: string | null;
    userId?: string | null;
    code?: string | null;
    args?: any | null;
    lastState?: any | null;
    device?: string | null;
    members?: Array<string> | null;
    deviceData?: IIotDeviceType | null;
    enabled?: boolean | null;
}

  
  export interface IDocumentationNode {
    __typename?: "DocumentationNode";
    id?: string | null;
    name?: string | null;
    title?: string | null;
    content?: string | null;
    source?: string | null;
    createdAt?: number | null;
    updatedAt?: number | null;
}

  
  export interface IAvailableModels {
    __typename?: "AvailableModels";
    value?: string | null;
    label?: string | null;
}

  
  export interface IChat {
    __typename?: "Chat";
    id?: string | null;
    name?: string | null;
    projectId?: string | null;
    participants?: Array<IUserType> | null;
    messages?: Array<IChatMessage> | null;
    attachments?: Array<IGraphqlFile> | null;
    activeRun?: IChatRun | null;
}

  
  export interface IChatMessage {
    __typename?: "ChatMessage";
    id?: string | null;
    content?: string | null;
    from?: string | null;
    user?: IUserType | null;
    chatId?: string | null;
    chat?: IChat | null;
    thoughts?: Array<string> | null;
    model?: string | null;
    createdAt?: string | null;
    usageMetadata?: IUsageMetadataOutput | null;
    parentMessageId?: string | null;
    /**
    description?: True when this message is a sub-agent (worker) result produced by spawnAgent — the UI renders it as a compact task card, not a bubble
  */
    worker?: boolean | null;
    /**
    description?: Agent type of the worker (LAMBDA, PLAN, CHAT)
  */
    workerType?: string | null;
    /**
    description?: The task prompt the worker was spawned with
  */
    workerPrompt?: string | null;
    attachments?: Array<IGraphqlFile> | null;
}

  
  export interface IUsageMetadataOutput {
    __typename?: "UsageMetadataOutput";
    promptTokenCount?: number | null;
    candidatesTokenCount?: number | null;
    totalTokenCount?: number | null;
    cachedContentTokenCount?: number | null;
}

  
  export interface IChatRun {
    __typename?: "ChatRun";
    chatId?: string;
    status?: string;
    modelName?: string | null;
    thoughts?: Array<string> | null;
    startedAt?: string | null;
}

  
  export interface IMcpTool {
    __typename?: "McpTool";
    /**
    description?: MCP tool name (the GraphQL operation name)
  */
    name?: string | null;
    /**
    description?: Short tool description reported by the MCP server
  */
    description?: string | null;
}

  
  export interface IAgent {
    __typename?: "Agent";
    /**
    description?: Unique identifier for the agent
  */
    id?: string | null;
    /**
    description?: Human-readable agent name
  */
    name?: string | null;
    /**
    description?: Agent type slug — an uppercase identifier such as LAMBDA, PLAN, CHAT, AUTO, FINANCE, PLUGINS. Free-form so new specialized worker types can be created from the admin panel
  */
    type?: string | null;
    /**
    description?: One-line summary of what this agent specializes in — shown in the chat mode selector and given to the AUTO orchestrator so it can pick the right worker
  */
    description?: string | null;
    /**
    description?: System prompt / instructions given to the agent
  */
    instructions?: string | null;
    /**
    description?: List of MCP tool names available to this agent
  */
    tools?: Array<string> | null;
    /**
    description?: Whether this agent is currently active
  */
    isActive?: boolean | null;
    /**
    description?: Optional AI model override for this agent
  */
    modelName?: string | null;
    /**
    description?: Timestamp when the agent was created
  */
    createdAt?: number | null;
    /**
    description?: Timestamp when the agent was last updated
  */
    updatedAt?: number | null;
}

  
  export interface IAgentTypeInfo {
    __typename?: "AgentTypeInfo";
    /**
    description?: Agent type slug (LAMBDA, PLAN, CHAT, AUTO, ...)
  */
    type?: string | null;
    /**
    description?: Human-readable agent name
  */
    name?: string | null;
    /**
    description?: One-line summary of what this agent specializes in
  */
    description?: string | null;
}

  
  export interface IAgentTask {
    __typename?: "AgentTask";
    /**
    description?: Chat conversation ID
  */
    chatId?: string | null;
    /**
    description?: Unique task identifier
  */
    taskId?: string | null;
    /**
    description?: Message ID associated with the task
  */
    messageId?: string | null;
    /**
    description?: Task status?: running, completed, cancelled, or error
  */
    status?: string | null;
    /**
    description?: Current reasoning/thought from the running agent
  */
    thought?: string | null;
    /**
    description?: Final result summary when completed
  */
    summary?: string | null;
    /**
    description?: ISO timestamp when the task started
  */
    startedAt?: string | null;
}

  
  export interface IStripeConfiguration {
    __typename?: "StripeConfiguration";
    publishableKey?: string | null;
}

  
  export interface IPaymentMethodResponse {
    __typename?: "PaymentMethodResponse";
    paymentMethods?: Array<IPaymentMethod> | null;
    defaultPaymentMethodId?: string | null;
}

  
  export interface IPaymentMethod {
    __typename?: "PaymentMethod";
    id?: string | null;
    link?: boolean | null;
    card?: IPaymentMethodCard | null;
}

  
  export interface IPaymentMethodCard {
    __typename?: "PaymentMethodCard";
    brand?: string | null;
    last4?: string | null;
    exp_month?: number | null;
    exp_year?: number | null;
}

  
  export interface IMigrationType {
    __typename?: "MigrationType";
    id?: string | null;
    fileName?: string | null;
    appliedAt?: string | null;
}

  
  export interface IProcessGenericType {
    __typename?: "ProcessGenericType";
    stderr?: string | null;
    stdout?: string | null;
}

  
  export interface IDatabaseFilter {
    date?: string | null;
    timestamp?: string | null;
}

  
  export interface IAmazonFile {
    __typename?: "AmazonFile";
    Key?: string | null;
    LastModified?: string | null;
    ETag?: string | null;
    Size?: number | null;
    StorageClass?: string | null;
    Owner?: IAmazonOwner | null;
}

  
  export interface IAmazonOwner {
    __typename?: "AmazonOwner";
    ID?: string | null;
}

  
  export interface IAppType {
    __typename?: "AppType";
    id?: number | null;
}

  /**
    description?: 
  Functions defined inside an environment "pool" with type "poolmgr" are relying on scale options defined in the pool itself
  Functions defined as "newdeploy" are using only the image from the pool for execution and scale options are defined in the function itself
  
  Scale options description?:
  (minMemory, maxMemory, minCpu, maxCpu) used per pod inside the pool usable for functions with type poolmgr aka pool managed scalability

  IMPORTANT?: type FissionEnvironmentInputType has the same description
  
  */
  export interface IFissionEnvironmentType {
    __typename?: "FissionEnvironmentType";
    id?: string | null;
    /**
    description?: Project namespace where this environment is attached
  */
    projectId?: string | null;
    /**
    description?: Name of the environment by default is "nodejs" but it can be any text
  */
    name?: string | null;
    /**
    description?: The environment docker image in which functions will be runned against, default one is "rxdi/fission-node?:0.0.5"
  */
    image?: string | null;
    /**
    description?: The environment builder image in which packages and builds will be runned for a function in this pool
  */
    builder?: string | null;
    /**
    description?: 
      How many active pods will remain waiting for a function execution.
      Keep in mind they are long lived and will remain running and consume CPU and memory
      If pool size is set to 0 function pods relying on "poolmgr" will not be working! 
      If pool size is set to 0 function pods relying on "newdeploy", will use only the builder image and will spawn a new deploy when function is runned
      If "newdeploy" is set ALWAYS set the poolSize to 0 since we don't need running pods
      If "newdeploy" is set but this pool is used by functions with "poolmgr" there should be always active poolSize > 0 aka 1 and more or functions relying on poolmgr will not have pods available the "newdeploy" ones will work without a problem.

      These settings are fine tunnings when choosing between "newdeploy" and "poolmgr" for function creation.
      If newdeploy is set per function this means we are aiming towards scalability and these functions are managed by HPA (Kubernetes Horizontal Pod Autoscaling)
      If poolmgr is set per function this means we are aiming towards hot containers(pods) always waiting for function attachment and execution of the requests
      After one pod is associated with a function new one "empty" spawns to wait for another execution if function CPU and Memory are too high it will associate new pod to spawn the function
    
      
  */
    poolSize?: number | null;
    /**
    description?: 
      Hard cap on the TOTAL number of "poolmgr" pods this environment may have at once?:
      the warm pool (poolSize) plus every specialized (function) pod across all functions in it.
      Once the cap is reached the executor refuses to specialize a new pod and the invocation
      fails fast with HTTP 429 instead of provisioning more pods. This prevents a flood of
      invocations (e.g. a misconfigured KEDA/message-queue trigger) from provisioning unbounded
      pods and exhausting the cluster.
      0 (the default) means unlimited. Only applies to "poolmgr" functions ("newdeploy" is already
      bounded by its own HPA maxScale). Should be >= poolSize.
      
  */
    maxPods?: number | null;
    /**
    description?: Maximum number of builder pods for this environment. Builder pods are provisioned on demand (one per concurrent build) up to this cap, then scaled back to zero when idle. Building one lambda uses one pod regardless of this value. Default is 1
  */
    builderPoolSize?: number | null;
    /**
    description?: Builds a single builder pod will accept (MAX_PARALLEL_BUILDS). Default is 1 (one build per pod); independent of builderPoolSize
  */
    builderMaxParallelBuilds?: number | null;
    /**
    description?: Seconds a builder pod stays up after its last build before scaling to zero. 0 = never scale down. Default is 600 (10 minutes)
  */
    builderIdleTimeout?: number | null;
    maxCpu?: number | null;
    maxMemory?: number | null;
    minCpu?: number | null;
    minMemory?: number | null;
    region?: IEnvironmentRegionEnum | null;
    /** The private cluster this environment runs on; null = the shared cluster. */
    clusterId?: string | null;
    /** Human-readable name of the cluster this environment runs on; null = shared. */
    clusterName?: string | null;
}

export
  type IEnvironmentRegionEnum = 'DEFAULT' | 'EU_BALKANS' | 'EU_CENTRAL';

  
  export interface IMessageQueueTrigger {
    __typename?: "MessageQueueTrigger";
    id?: string | null;
    projectId?: string | null;
    name?: string | null;
    lambdaName?: string | null;
    requestTopic?: string | null;
    responseTopic?: string | null;
    errorTopic?: string | null;
    maxRetries?: number | null;
    coolDownPeriod?: number | null;
    pollingInterval?: number | null;
    minReplicaCount?: number | null;
    maxReplicaCount?: number | null;
    threshold?: number | null;
}

  
  export interface IFissionTimeTriggerType {
    __typename?: "FissionTimeTriggerType";
    id?: string | null;
    triggerName?: string | null;
    createdBy?: string | null;
    projectId?: string | null;
    lambdaId?: string | null;
    cron?: string | null;
}

export   
  type ICompressionTypeEnum = 'GZIP' | 'LZW';

  
  export interface ILambdaLogsPagination {
    year?: string | null;
    month?: string | null;
    day?: string | null;
    hour?: string | null;
    pod?: string | null;
}

  
  export interface IFissionLogsType {
    __typename?: "FissionLogsType";
    data?: string | null;
}

  
  export interface IAvailableLogDates {
    __typename?: "AvailableLogDates";
    year?: string | null;
    months?: Array<IAvailableLogMonth> | null;
}

  
  export interface IAvailableLogMonth {
    __typename?: "AvailableLogMonth";
    month?: string | null;
    days?: Array<IAvailableLogDay> | null;
}

  
  export interface IAvailableLogDay {
    __typename?: "AvailableLogDay";
    day?: string | null;
    hours?: Array<IAvailableLogHour> | null;
}

  
  export interface IAvailableLogHour {
    __typename?: "AvailableLogHour";
    hour?: string | null;
    pods?: Array<string> | null;
}

  
  export interface IFissionType {
    __typename?: "FissionType";
    id?: string | null;
    /**
    description?: Project mapped to this specific lambda function
  */
    projectId?: string | null;
    /**
    description?: Name of the lambda function it can be for example "my-lambda-function" 
  */
    name?: string | null;
    /**
    description?: This is the URL in which the lambda is exposed to public
  */
    url?: string | null;
    /**
    description?: Route on which lambda will be served for example it can be the same as name of the lambda "my-lambda-function"
  */
    route?: string | null;
    /**
    description?: 
        Route params for example /{projectId}/{objectId} will be defined as "projectId,objectId" inside the input
        The parameters can then be used inside the lambda as follow?:
        "context.getRouteParams()" will return Object with {projectId?: '', objectId?: ''}
      
  */
    params?: Array<string> | null;
    /**
    description?: .
        Basic code example on how basic lambda should look a like in javascript/nodejs
        
        ****** Basic
          export default async function (context) {
            return {
              status?: 200,
              body?: 'Hello, world!',
              headers?: {
                'Access-Control-Allow-Origin'?: 'https?://lambforge.com',
              },
            };
          };
        ******

        ****** Advanced Graphql using @gapi/core
          import {
            Bootstrap,
            Controller,
            CoreModule,
            GraphQLObjectType,
            GraphQLString,
            Module,
            Query,
            Type,
          } from '@gapi/core';

          @Controller()
          class Appcontroller {
            @Type(
              new GraphQLObjectType({
                name?: 'UserType',
                fields?: () => ({
                  id?: { type?: GraphQLString },
                  name?: { type?: GraphQLString },
                }),
              }),
            )
            @Query()
            getUser() {
              return {
                id?: 1,
                name?: 'Hello World',
              };
            }
          }

          @Module({
            imports?: [CoreModule.forRoot()],
            controllers?: [Appcontroller],
          })
          class AppModule {}

          Bootstrap(AppModule).subscribe();
        ******


      
  */
    code?: string | null;
    /**
    description?: 
      This is a name of the kubernetes secret can be used in the lambda code section as follows

      const environment = await context.getSecret('environment');

      
  */
    secrets?: Array<IKubectlConfig> | null;
    /**
    description?: 
      # envSecrets (read by the nodejs-graphql runtime BEFORE the bundle loads)
      # projects all keys of these mounted secrets into process.env, so the existing
      # process.env-based ENVIRONMENT (src/app/app.constants.ts) works unchanged.
      currently only usable in graphql environment
            
  */
    envSecrets?: Array<string> | null;
    /**
    description?: 
      This is a name of the kubernetes secret can be used in the lambda code section as follows

      const environment = await context.getSecret('environment');

      
  */
    configs?: Array<IKubectlConfig> | null;
    /**
    description?: Environment can be for now only on NODEJS
  */
    env?: string | null;
    /**
    description?: Environment can be for now only on NODEJS
  */
    environment?: IFissionEnvironmentType | null;
    /**
    description?: Can be one of the http methods GET,POST,UPDATE,DELETE,PUT
  */
    method?: Array<IHttpMethodsEnum> | null;
    /**
    description?: Can be defined as json object in string like this "{"dependencies"?:{}}"
  */
    packageJson?: string | null;
    /**
    description?: 
        This is the script which will be executed on build job before lambda initialization

**** START SCRIPT ****
#!/bin/sh
cd ${SRC_PKG}

npm install

mv index.js index.ts
npx @gapi/gcli build

rm -rf node_modules
cp -r ${SRC_PKG} ${DEPLOY_PKG}
**** END SCRIPT ****

        It can be null and it will build the function automatically with the script above
        This is just for reference so we can learn how to structure buildBashScript

      
  */
    buildBashScript?: string | null;
    /**
    description?: 
      This is handled by the @gapi/gcli npm library and we can upload whole archive in S3 Amazon
      This archive will be then fetched by the function and used
      The idea is that we can deploy using CI/CD and we can bundle our code to a single index.js file
      And then this code will be used to initiate the lambda creation
      
  */
    customUploadFileId?: string | null;
    customUploadFile?: IGraphqlLambdaFile | null;
    /**
    description?: Who is the creator of this lambda it is ObjectId in mongodb
  */
    createdBy?: string | null;
    /**
    description?: When this lambda is created
  */
    createdAt?: string | null;
    /**
    description?: When this lambda is updated
  */
    updatedAt?: string | null;
    /**
    description?: Disable external traffic to hit the lambda function using http
  */
    network?: Array<string> | null;
    /**
    description?: When true this lambda is provisioned as an Graphql Federation gateway
  */
    federation?: boolean | null;
    /**
    description?: Lambda names (same project) exposed as subgraphs of the federation gateway
  */
    subgraphs?: Array<string> | null;
    /**
    description?: When true this lambda is provisioned as an MCP Server in front of a federation graph
  */
    mcp?: boolean | null;
    /**
    description?: Name of the federation gateway lambda the MCP server connects to
  */
    mcpGraph?: string | null;
    /**
    description?: Curated GraphQL operations exposed as MCP tools
  */
    mcpOperations?: Array<IMcpOperationType> | null;
    /**
    description?: Static headers added to every request the MCP server makes to the federation endpoint
  */
    mcpHeaders?: Array<IMcpHeaderType> | null;
    /**
    description?: Additional request headers forwarded from the caller to the federation endpoint (Authorization is always forwarded)
  */
    mcpForwardHeaders?: Array<IMcpForwardHeaderType> | null;
    /**
    description?: Enable Cloudflare CDN caching for this lambda. When enabled, responses will be cached at Cloudflare's edge network, reducing origin requests and improving latency for repeated requests.
  */
    cache?: boolean | null;
    /**
    description?: 
        Default scale options for "poolmgr" are these and are defined in JSON 
        {
            "minCpu"?: 0,
            "maxCpu"?: 0,
            "minMemory"?: 0,
            "maxMemory"?: 0,
            "minScale"?: 0,
            "maxScale"?: 0,
            "targetCpu"?: 0,
            "executorType"?: "poolmgr",
            "concurrency"?: 1,
            "functionTimeout"?: 60,
            "idleTimeout"?: 120,
            "specializationTimeout"?: 120
            "retainPods"?: 0,
            "requestPerPod"?: 1000
        }
        IMPORTANT?: When "executorType" is set to "poolmgr" minScale,maxScale,targetCpu,minCpu,maxCpu,minMemory,maxMemory are DISABLED for EDIT and should ALWAYS be 0!
        IMPORTANT?: When "executorType" is set to "poolmgr" these settings are defined inside the Environment Pool instead and managed by the pool not per lambda
        "scaleOptions" field can be left null and it will default to specific values
      
  */
    scaleOptions?: ILambdaScaleOptions | null;
    /**
    description?: 
        This is cronjob aka time trigger attached to the lambda 
        Especially usefull if you want to create a recurrent jobs like 
        Do this in @every hour or do this @daily or @monthly or @weekly

        @yearly | Once a year, midnight, Jan. 1st |0 0 0 1 1 *|
        @monthly| Once a month, midnight, first of month |0 0 0 1 * *|
        @weekly | Once a week, midnight between Sat/Sun |0 0 0 * * 0|
        @daily | Once a day, midnight |0 0 0 * * *|
        @hourly | Once an hour, beginning of hour |0 0 * * * *|
        
  */
    trigger?: IFissionTimeTriggerType | null;
    revision?: any | null;
    revisions?: any | null;
    logs?: ILambdaLogs | null;
}

  
  export interface IKubectlConfig {
    __typename?: "KubectlConfig";
    id?: string | null;
    projectId?: string | null;
    immutable?: boolean | null;
    name?: string | null;
    apiVersion?: string | null;
    data?: any | null;
    kind?: string | null;
    metadata?: IKubectlConfigMapMetadata | null;
    type?: string | null;
}

  
  export interface IKubectlConfigMapMetadata {
    __typename?: "KubectlConfigMapMetadata";
    creationTimestamp?: string | null;
    name?: string | null;
    namespace?: string | null;
    resourceVersion?: string | null;
    uid?: string | null;
    labels?: any | null;
    finalizers?: Array<string> | null;
    annotations?: any | null;
}

export   
  type IHttpMethodsEnum = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'OPTIONS';

  
  export interface IGraphqlLambdaFile {
    __typename?: "GraphqlLambdaFile";
    id?: string | null;
    url?: string | null;
}

  
  export interface IMcpOperationType {
    __typename?: "McpOperationType";
    name?: string | null;
    query?: string | null;
}

  
  export interface IMcpHeaderType {
    __typename?: "McpHeaderType";
    name?: string | null;
    value?: string | null;
}

  
  export interface IMcpForwardHeaderType {
    __typename?: "McpForwardHeaderType";
    name?: string | null;
}

  
  export interface ILambdaScaleOptions {
    __typename?: "LambdaScaleOptions";
    /**
    description?: 
    Minimum CPU to be assigned to pod (In millicore, minimum 1) usable in "newdeploy"
    
  */
    minCpu?: number | null;
    /**
    description?: 
    Maximum CPU to be assigned to pod (In millicore, minimum 1) usable in "newdeploy"
    
  */
    maxCpu?: number | null;
    /**
    description?: 
    Minimum memory to be assigned to pod (In megabyte) usable in "newdeploy"
    
  */
    minMemory?: number | null;
    /**
    description?: 
    Maximum memory to be assigned to pod (In megabyte) usable in "newdeploy"
    
  */
    maxMemory?: number | null;
    /**
    description?: 
    Minimum number of pods (Uses resource inputs to configure HPA) usable in "newdeploy"
    
  */
    minScale?: number | null;
    /**
    description?: 
    Maximum number of pods (Uses resource inputs to configure HPA) usable in "newdeploy"
    
  */
    maxScale?: number | null;
    /**
    description?: 
      Target average CPU usage percentage across pods for scaling usable in "newdeploy"
    
  */
    targetCpu?: number | null;
    /**
    description?: 
      Executor type for execution; one of 'poolmgr', 'newdeploy' it defaults to "poolmgr"
    
  */
    executorType?: ILambdaScaleOptionsExecutorTypeEnum | null;
    /**
    description?: 
      The length of time (in seconds) that a function is idle before pod(s) are eligible for recycling
    
  */
    idleTimeout?: number | null;
    /**
    description?: 
      Maximum number of pods specialized concurrently to serve (Only valid for executortype; "poolmgr")
    
  */
    concurrency?: number | null;
    /**
    description?: 
      Maximum time for a request to wait for the response from the function
    
  */
    functionTimeout?: number | null;
    /**
    description?: 
      Timeout for executor to wait for function pod creation
    
  */
    specializationTimeout?: number | null;
    /**
    description?: 
     	The Warm Oven?: Keeps specific "Ready" pods alive so the first user doesn't wait (Cold Start).
      Even if nobody is using the function, keep X number of warm pods alive in the cluster prepared and ready to go.
    
  */
    retainPods?: number | null;
    /**
    description?: 
      Maximum number of concurrent requests that can be served by a specialized pod (Only valid for executortype; "poolmgr")
    
  */
    requestsPerPod?: number | null;
}

export   
  type ILambdaScaleOptionsExecutorTypeEnum = 'poolmgr' | 'newdeploy';

  
  export interface ILambdaLogs {
    __typename?: "LambdaLogs";
    builder?: IFissionLogsType | null;
    function?: IFissionLogsType | null;
}

  
  export interface IGeneratedMcpOperationType {
    __typename?: "GeneratedMcpOperationType";
    /**
    description?: PascalCase root field name — becomes the MCP tool name.
  */
    name?: string | null;
    /**
    description?: The root field this operation targets.
  */
    rootField?: string | null;
    /**
    description?: "query" or "mutation".
  */
    kind?: string | null;
    /**
    description?: The complete, named GraphQL operation document.
  */
    query?: string | null;
    /**
    description?: Field description from the schema, if any.
  */
    description?: string | null;
}

  
  export interface ILambdaDocChunk {
    __typename?: "LambdaDocChunk";
    name?: string | null;
    title?: string | null;
    content?: string | null;
    category?: string | null;
    keywords?: string | null;
    relatedTo?: Array<string> | null;
}

  
  export interface IGenericKubectName {
    name?: string;
    projectId?: string;
}

  
  export interface IMongoAtlasConnector {
    __typename?: "MongoAtlasConnector";
    id?: string | null;
    connectorName?: string | null;
    atlasProjectName?: string | null;
    orgId?: string | null;
    projectId?: string | null;
    allowedIps?: Array<IMongoAtlasConnectorAllowedIps> | null;
}

  
  export interface IMongoAtlasConnectorAllowedIps {
    __typename?: "MongoAtlasConnectorAllowedIps";
    ip?: string | null;
    description?: string | null;
}

  
  export interface IRabbitMq {
    __typename?: "RabbitMq";
    id?: string | null;
    name?: string | null;
    description?: string | null;
    projectId?: string | null;
    region?: IEnvironmentRegionEnum | null;
    storage?: IRabbitMqStorageOutput | null;
    queues?: Array<IRabbitMqQueue> | null;
    /** The private cluster this broker lives on; null = the shared cluster. */
    clusterId?: string | null;
    /** Human-readable name of the cluster this broker lives on; null = shared. */
    clusterName?: string | null;
}

  
  export interface IRabbitMqStorageOutput {
    __typename?: "RabbitMqStorageOutput";
    enabled?: boolean | null;
    size?: IRabbitMqStorageSizeEnum | null;
}

export   
  type IRabbitMqStorageSizeEnum = 'X_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE';

  
  export interface IRabbitMqQueue {
    __typename?: "RabbitMqQueue";
    id?: string | null;
    rabbitMqId?: string | null;
    name?: string | null;
    vhost?: string | null;
    durable?: boolean | null;
    auto_delete?: boolean | null;
}

  
  export interface IKubernetesMetrics {
    __typename?: "KubernetesMetrics";
    nodes?: Array<IKubernetesNode> | null;
    clusterTotals?: IKubernetesClusterTotals | null;
}

  
  export interface IKubernetesNode {
    __typename?: "KubernetesNode";
    name?: string | null;
    cpu?: IResourceMetrics | null;
    memory?: IResourceMetrics | null;
    pods?: Array<IKubernetesPod> | null;
}

  
  export interface IResourceMetrics {
    __typename?: "ResourceMetrics";
    requests?: string | null;
    requestsPercent?: string | null;
    limits?: string | null;
    limitsPercent?: string | null;
    utilization?: string | null;
    utilizationPercent?: string | null;
}

  
  export interface IKubernetesPod {
    __typename?: "KubernetesPod";
    name?: string | null;
    namespace?: string | null;
    cpu?: IResourceMetrics | null;
    memory?: IResourceMetrics | null;
}

  
  export interface IKubernetesClusterTotals {
    __typename?: "KubernetesClusterTotals";
    cpu?: IResourceMetrics | null;
    memory?: IResourceMetrics | null;
}

  
  export interface IKubernetesResourceQuotaList {
    __typename?: "KubernetesResourceQuotaList";
    apiVersion?: string | null;
    kind?: string | null;
    items?: Array<IKubernetesResourceQuota> | null;
    metadata?: IKubectlConfigMapMetadata | null;
}

  
  export interface IKubernetesResourceQuota {
    __typename?: "KubernetesResourceQuota";
    apiVersion?: string | null;
    kind?: string | null;
    metadata?: IKubectlConfigMapMetadata | null;
    spec?: any | null;
    status?: any | null;
}

  
  export interface IKubernetesLimitRangeList {
    __typename?: "KubernetesLimitRangeList";
    apiVersion?: string | null;
    kind?: string | null;
    spec?: ILimitRangeSpec | null;
    metadata?: IKubectlConfigMapMetadata | null;
}

  
  export interface ILimitRangeSpec {
    __typename?: "LimitRangeSpec";
    limits?: Array<ILimitRangeSpecLimits> | null;
}

  
  export interface ILimitRangeSpecLimits {
    __typename?: "LimitRangeSpecLimits";
    default?: IKubernetesClusterTotalsString | null;
    defaultRequest?: IKubernetesClusterTotalsString | null;
    max?: IKubernetesClusterTotalsString | null;
    maxLimitRequestRatio?: IKubernetesClusterTotalsString | null;
    min?: IKubernetesClusterTotalsString | null;
    type?: string | null;
}

  
  export interface IKubernetesClusterTotalsString {
    __typename?: "KubernetesClusterTotalsString";
    cpu?: string | null;
    memory?: string | null;
}

  
  export interface IPrometheusData {
    __typename?: "PrometheusData";
    result?: Array<IPrometheusResultType> | null;
    resultType?: string | null;
    stats?: IPrometheusResultStats | null;
}

  
  export interface IPrometheusResultType {
    __typename?: "PrometheusResultType";
    metric?: IPrometheusQueryMetrics | null;
    value?: any | null;
}

  
  export interface IPrometheusQueryMetrics {
    __typename?: "PrometheusQueryMetrics";
    application?: string | null;
    code?: string | null;
    function_name?: string | null;
    function_namespace?: string | null;
    instance?: string | null;
    job?: string | null;
    method?: string | null;
    namespace?: string | null;
    node?: string | null;
    path?: string | null;
    pod?: string | null;
    pod_template_hash?: string | null;
    svc?: string | null;
    name?: string | null;
}

  
  export interface IPrometheusResultStats {
    __typename?: "PrometheusResultStats";
    samples?: IPrometheusResultStatsSamples | null;
    timings?: IPrometheusResultStatsTimings | null;
}

  
  export interface IPrometheusResultStatsSamples {
    __typename?: "PrometheusResultStatsSamples";
    peakSamples?: number | null;
    totalQueryableSamples?: number | null;
}

  
  export interface IPrometheusResultStatsTimings {
    __typename?: "PrometheusResultStatsTimings";
    evalTotalTime?: number | null;
    execQueueTime?: number | null;
    execTotalTime?: number | null;
    innerEvalTime?: number | null;
    queryPreparationTime?: number | null;
    resultSortTime?: number | null;
}

  
  export interface ILambdaFunctionStatistics {
    __typename?: "LambdaFunctionStatistics";
    totalLambdaColdStarts?: number | null;
    totalLambdaExecutions?: number | null;
    functions?: Array<ILambdaFunctionsStats> | null;
}

  
  export interface ILambdaFunctionsStats {
    __typename?: "LambdaFunctionsStats";
    name?: string | null;
    coldStarts?: number | null;
    calls?: number | null;
    path?: string | null;
    method?: string | null;
}

export   
  type IMetricsResourceTypeEnum = 'pod' | 'namespace';

export   
  type IAccumulatedPricingWindowEnum = 'TODAY' | 'SEVEN' | 'FOURTEEN' | 'THIRTY';

  
  export interface ICostEstimateResult {
    __typename?: "CostEstimateResult";
    start?: string | null;
    end?: string | null;
    items?: Array<ICostAllocation> | null;
}

  
  export interface ICostAllocation {
    __typename?: "CostAllocation";
    name?: string | null;
    properties?: ICostProperties | null;
    window?: ICostWindow | null;
    start?: string | null;
    end?: string | null;
    minutes?: number | null;
    cpuCores?: number | null;
    cpuCoreRequestAverage?: number | null;
    cpuCoreUsageAverage?: number | null;
    cpuCoreHours?: number | null;
    cpuCost?: number | null;
    cpuCostAdjustment?: number | null;
    cpuCostIdle?: number | null;
    cpuEfficiency?: number | null;
    gpuCount?: number | null;
    gpuHours?: number | null;
    gpuCost?: number | null;
    gpuCostAdjustment?: number | null;
    gpuCostIdle?: number | null;
    gpuEfficiency?: number | null;
    networkTransferBytes?: number | null;
    networkReceiveBytes?: number | null;
    networkCost?: number | null;
    networkCrossZoneCost?: number | null;
    networkCrossRegionCost?: number | null;
    networkInternetCost?: number | null;
    networkCostAdjustment?: number | null;
    loadBalancerCost?: number | null;
    loadBalancerCostAdjustment?: number | null;
    pvBytes?: number | null;
    pvByteHours?: number | null;
    pvCost?: number | null;
    pvCostAdjustment?: number | null;
    ramBytes?: number | null;
    ramByteRequestAverage?: number | null;
    ramByteUsageAverage?: number | null;
    ramByteHours?: number | null;
    ramCost?: number | null;
    ramCostAdjustment?: number | null;
    ramCostIdle?: number | null;
    ramEfficiency?: number | null;
    externalCost?: number | null;
    sharedCost?: number | null;
    totalCost?: number | null;
    totalEfficiency?: number | null;
    pvs?: any | null;
    proportionalAssetResourceCosts?: any | null;
    sharedCostBreakdown?: any | null;
    lbAllocations?: any | null;
    gpuAllocation?: any | null;
}

  
  export interface ICostProperties {
    __typename?: "CostProperties";
    cluster?: string | null;
    namespace?: string | null;
}

  
  export interface ICostWindow {
    __typename?: "CostWindow";
    start?: string | null;
    end?: string | null;
}

  
  export interface IProjectEntitlement {
    __typename?: "ProjectEntitlement";
    scope?: string | null;
    tierId?: string | null;
    projectId?: string | null;
    maxEnvironments?: number | null;
    maxFunctions?: number | null;
    maxWarmPools?: number | null;
    maxNewDeployFunctions?: number | null;
    maxReplicasPerFunction?: number | null;
    maxStorageGb?: number | null;
    maxMemoryMb?: number | null;
    maxCpuCores?: number | null;
    maxFunctionTimeout?: number | null;
    maxSpecializationTimeout?: number | null;
    maxConcurrency?: number | null;
    maxRequestsPerPod?: number | null;
    allowedBuilderImages?: Array<string> | null;
    allowedRunnerImages?: Array<string> | null;
    maxPoolSize?: number | null;
    maxEnvironmentPods?: number | null;
    maxBuilderPoolSize?: number | null;
    maxBuilderParallelBuilds?: number | null;
    maxBuilderIdleTimeout?: number | null;
    allowHttpTriggers?: boolean | null;
    allowCronTriggers?: boolean | null;
    allowMqTriggers?: boolean | null;
    allowEventTriggers?: boolean | null;
    allowRabbitMqConnector?: boolean | null;
    allowMongoAtlasConnector?: boolean | null;
    allowPostgresConnector?: boolean | null;
    allowRedisConnector?: boolean | null;
    allowMarketplace?: boolean | null;
    allowedMarketplaceCategories?: Array<string> | null;
    allowedMarketplaceApps?: Array<string> | null;
    deniedMarketplaceApps?: Array<string> | null;
    allowCiCdTokens?: boolean | null;
    maxCiCdTokens?: number | null;
    allowAiChat?: boolean | null;
    allowedAiProviders?: Array<string> | null;
    dailyAiTokenQuota?: number | null;
    weeklyAiTokenQuota?: number | null;
    monthlyAiTokenQuota?: number | null;
    customFeatures?: any | null;
}

  
  export interface IFormDefinition {
    __typename?: "FormDefinition";
    name?: string | null;
    layout?: boolean | null;
    fields?: Array<IFormField> | null;
}

  
  export interface IFormField {
    __typename?: "FormField";
    name?: string | null;
    label?: string | null;
    type?: IFormInputTypeEnum | null;
    minlength?: number | null;
    maxlength?: number | null;
    min?: number | null;
    max?: number | null;
    pattern?: string | null;
    placeholder?: string | null;
    validators?: Array<IFormFieldValidator> | null;
    value?: any | null;
    options?: Array<IFormSelectOption> | null;
    autocomplete?: string | null;
    patternError?: string | null;
    multiple?: boolean | null;
    children?: Array<IFormField> | null;
    description?: string | null;
    columns?: number | null;
    enabledWhen?: IFieldDependency | null;
    visibleWhen?: IFieldDependency | null;
    disabled?: boolean | null;
    autoDefault?: boolean | null;
    toggle?: boolean | null;
    disabledWhen?: IFieldDependency | null;
    bindWith?: IFieldBindWith | null;
    layout?: string | null;
    step?: number | null;
}

export   
  type IFormInputTypeEnum = 'text' | 'number' | 'password' | 'email' | 'select' | 'array' | 'textarea' | 'json' | 'bash' | 'code' | 'dropdown' | 'object' | 'checkbox' | 'radio' | 'mcp_operations';

  
  export interface IFormFieldValidator {
    __typename?: "FormFieldValidator";
    name?: string | null;
    args?: string | null;
}

  
  export interface IFormSelectOption {
    __typename?: "FormSelectOption";
    label?: string | null;
    value?: string | null;
}

  
  export interface IFieldDependency {
    __typename?: "FieldDependency";
    field?: string | null;
    value?: string | null;
}

  
  export interface IFieldBindWith {
    __typename?: "FieldBindWith";
    sourceField?: string | null;
    transform?: string | null;
    transformArgs?: any | null;
    disableTarget?: boolean | null;
}

  
  export interface IInvoice {
    __typename?: "Invoice";
    id?: string | null;
    invoiceNumber?: string | null;
    namespace?: string | null;
    billingPeriod?: IInvoiceBillingPeriod | null;
    lineItems?: Array<IInvoiceLineItem> | null;
    subtotal?: number | null;
    tax?: number | null;
    total?: number | null;
    status?: string | null;
    issuedAt?: number | null;
    paidAt?: string | null;
    pdfUrl?: string | null;
    createdAt?: number | null;
    updatedAt?: number | null;
}

  
  export interface IInvoiceBillingPeriod {
    __typename?: "InvoiceBillingPeriod";
    start?: string | null;
    end?: string | null;
}

  
  export interface IInvoiceLineItem {
    __typename?: "InvoiceLineItem";
    type?: string | null;
    description?: string | null;
    quantity?: number | null;
    unitPrice?: number | null;
    amount?: number | null;
}

  
  export interface IPodCostBreakdown {
    __typename?: "PodCostBreakdown";
    podName?: string | null;
    totalCost?: number | null;
    cpuCost?: number | null;
    ramCost?: number | null;
    pvCost?: number | null;
    efficiency?: number | null;
}

  
  export interface IPlugin {
    __typename?: "Plugin";
    id?: string | null;
    name?: string | null;
    description?: string | null;
    documentation?: string | null;
    logo?: string | null;
    pluginType?: IPluginTypeEnum | null;
    isActive?: boolean | null;
    configSchema?: any | null;
}

export   
  type IPluginTypeEnum = 'kubernetes' | 'helm' | 'external';

  
  export interface IInstalledPlugin {
    __typename?: "InstalledPlugin";
    plugin?: IPlugin | null;
    installedAt?: string | null;
    config?: any | null;
    /** Which installation this is - a project may have the same plugin on several clusters. Null = shared. */
    clusterId?: string | null;
    clusterName?: string | null;
}


  export interface ICluster {
    __typename?: "Cluster";
    id?: string | null;
    projectId?: string | null;
    name?: string | null;
    provider?: string | null;
    status?: IClusterStatusEnum | null;
    region?: string | null;
    serverType?: string | null;
    topology?: IClusterTopology | null;
    imageId?: string | null;
    endpoint?: string | null;
    error?: string | null;
}

  type IClusterStatusEnum = 'pending' | 'provisioning' | 'ready' | 'tearing-down' | 'error' | 'deleted';

  export interface IClusterTopology {
    __typename?: "ClusterTopology";
    workers?: number | null;
    singleNode?: boolean | null;
}


  export interface IProjectSummary {
    __typename?: "ProjectSummary";
    id?: string | null;
    name?: string | null;
    ownerEmail?: string | null;
    projectId?: string | null;
    tierName?: string | null;
    lambdaCount?: string | null;
    suspended?: string | null;
    cost7Days?: string | null;
    cost30Days?: string | null;
}

  
  export interface IClusterStatistics {
    __typename?: "ClusterStatistics";
    nodeCount?: string | null;
    totalCpu?: string | null;
    totalMemory?: string | null;
    cpuUtilizationPercent?: string | null;
    memoryUtilizationPercent?: string | null;
}

  
  export interface IResourceLimitAlert {
    __typename?: "ResourceLimitAlert";
    projectId?: string | null;
    projectName?: string | null;
    resourceType?: string | null;
    used?: string | null;
    quota?: string | null;
    percentage?: string | null;
    severity?: string | null;
}

  
  export interface IUser {
    __typename?: "User";
    id?: string | null;
    email?: string | null;
    lastActiveDate?: string | null;
    active?: boolean | null;
    tag?: string | null;
    user_id?: string | null;
    name?: string | null;
    photoURL?: string | null;
    scopes?: Array<string> | null;
}

  /**
    description?: One deployed lambda in a project (from listLambdas). `source` tells you how importLambda will virtualize it?: 'archive' (a customUploadFileId .zip) or 'code' (the code/packageJson/buildBashScript fields).
  */
  export interface ILambdaSummary {
    __typename?: "LambdaSummary";
    /**
    description?: The lambda document id.
  */
    id?: string;
    /**
    description?: Pass this as importLambda(lambdaName).
  */
    name?: string;
    route?: string | null;
    /**
    description?: 'archive' when the lambda has a customUploadFileId (.zip), else 'code'.
  */
    source?: string;
    /**
    description?: The uploaded-archive file id, when the lambda has one.
  */
    customUploadFileId?: string | null;
    deployStatus?: string | null;
    /**
    description?: The lambda environment/runtime.
  */
    runtime?: string | null;
    federation?: boolean | null;
    mcp?: boolean | null;
}

  /**
    description?: One persistent workspace directory in a project (from listWorkdirs), most-recently created first. Use this to recover a `workdir` name you lost track of, then target it with listFiles/getFile/writeFile/executeCode/publishProject.
  */
  export interface IWorkdirSummary {
    __typename?: "WorkdirSummary";
    /**
    description?: The workspace directory name, e.g. "ws-1f2e3d4c5b6a7089". Pass it as `workdir` in later calls.
  */
    workdir?: string;
    /**
    description?: ISO timestamp the workdir was minted, when tracked.
  */
    createdAt?: string | null;
    /**
    description?: Set when the workspace was seeded from a deployed lambda via importLambda — the natural target for re-deploying a publishProject artifact.
  */
    origin?: IWorkspaceOrigin | null;
}

  /**
    description?: Provenance of a workspace that was seeded from a deployed lambda (importLambda). Lets a client offer "re-deploy to the origin lambda" after publishProject?: attach the published customUploadFileId to this lambda and redeploy. Reflects the LAST import into the workdir.
  */
  export interface IWorkspaceOrigin {
    __typename?: "WorkspaceOrigin";
    /**
    description?: Mongo `lambda` document id, when the import was resolved by lambdaName.
  */
    lambdaId?: string | null;
    /**
    description?: The deployed lambda the workspace was imported from.
  */
    lambdaName?: string | null;
    /**
    description?: Mongo `file` id of the unpacked archive (archive source only).
  */
    fileId?: string | null;
    /**
    description?: How the lambda was virtualized into the workspace?: 'archive' or 'code'.
  */
    source?: string | null;
    /**
    description?: ISO timestamp of the import.
  */
    importedAt?: string | null;
}

  /**
    description?: One file in a persistent workspace (projects/<projectId>/<workdir>/<path>).
  */
  export interface IWorkspaceFile {
    __typename?: "WorkspaceFile";
    /**
    description?: Path relative to the workdir root, e.g. "lib/math.js".
  */
    path?: string;
    /**
    description?: Content size in bytes (UTF-8).
  */
    size?: number | null;
    /**
    description?: ISO timestamp of the last write, when the backend tracks one.
  */
    lastModified?: string | null;
    /**
    description?: The file content. Populated by getFile and writeFile; null in listFiles (fetch files individually to read them).
  */
    content?: string | null;
    /**
    description?: Paths that were NOT persisted because they exceeded the per-file size limit. Present on writeFile when the quota is hit.
  */
    skippedFiles?: Array<string>;
}

  /**
    description?: One published archive of a workspace (from listArtifacts), newest first. publishProject prunes on two tiers — per workspace (WORKSPACE_ARTIFACT_RETENTION, default 4) and per project overall (WORKSPACE_PROJECT_ARTIFACT_RETENTION, default 30) — except archives a lambda currently deploys from. Redeploy an older one by passing its `customUploadFileId` to the lambda update flow.
  */
  export interface IWorkspaceArtifact {
    __typename?: "WorkspaceArtifact";
    /**
    description?: Mongo `file` id — pass to the lambda create/update flow to deploy this exact archive.
  */
    customUploadFileId?: string;
    /**
    description?: S3 object key of the zip.
  */
    key?: string | null;
    bucket?: string | null;
    /**
    description?: Zip size in bytes.
  */
    bytes?: number | null;
    /**
    description?: SHA-256 of the zip.
  */
    sha256?: string | null;
    /**
    description?: The artifact name it was published under.
  */
    lambdaName?: string | null;
    /**
    description?: The workspace it was published from.
  */
    workdir?: string | null;
    /**
    description?: ISO timestamp of the publish.
  */
    createdAt?: string | null;
    /**
    description?: Set when a lambda currently deploys from this archive — its document id.
  */
    attachedLambdaId?: string | null;
    /**
    description?: Name of the lambda currently deploying from this archive.
  */
    attachedLambdaName?: string | null;
}

  /**
    description?: A saved plan document for a project (a `file` doc with additionalMetadata.kind="plan", stored under plans/<projectId>/<planId>.md). Listed in the Documents section and related to the chat that produced it. `content` is populated by getPlan; null in listPlans.
  */
  export interface IPlan {
    __typename?: "Plan";
    /**
    description?: The plan's Mongo `file` id — pass to getPlan/updatePlan.
  */
    planId?: string;
    /**
    description?: Human title shown in the Documents list.
  */
    title?: string;
    /**
    description?: Lifecycle?: 'draft' | 'polished' | 'feature' ('feature' = the user saved it as a tracked feature).
  */
    status?: string;
    /**
    description?: The chat that produced the plan, when saved with one.
  */
    chatId?: string | null;
    /**
    description?: Bumped each time the content is updated.
  */
    version?: number | null;
    /**
    description?: The plan markdown. Populated by getPlan/savePlan-input; null in listPlans (fetch one with getPlan).
  */
    content?: string | null;
    /**
    description?: Content size in bytes (UTF-8).
  */
    bytes?: number | null;
    /**
    description?: SHA-256 of the content.
  */
    sha256?: string | null;
    /**
    description?: S3 object key (plans/<projectId>/<planId>.md).
  */
    key?: string | null;
    bucket?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

  
  export interface IMutation {
    __typename?: "Mutation";
    makeRevolutOrder?: IRevolutOrderType | null;
    sale?: IBraintreeTransactionType | null;
    generateClientToken?: IBraintreeClientToken | null;
    addProjectUserScope?: IProjectPermissionType | null;
    addCard?: ICardType | null;
    deleteCard?: ICardType | null;
    updateCard?: ICardType | null;
    moveCard?: ICardType | null;
    uploadAttachment?: IFile | null;
    removeCardAttachment?: IGraphqlFile | null;
    addCardComment?: ICardType | null;
    updateCardComment?: ICardType | null;
    deleteCardComment?: ICardType | null;
    createBoardColumn?: IBoardColumnType | null;
    deleteBoardColumn?: IBoardColumnType | null;
    updateBoardColumn?: IBoardColumnType | null;
    sendMailReport?: IGraphqlFile | null;
    createBoard?: IBoardType | null;
    deleteBoard?: IBoardType | null;
    updateBoard?: IBoardType | null;
    createToken?: ICiTokensType | null;
    blackListToken?: ICiTokensType | null;
    deleteToken?: ICiTokensType | null;
    createProject?: IProjectType | null;
    assignProject?: Array<IProjectType> | null;
    updateAgentPurpose?: IProjectType | null;
    assignMachineToProject?: IProjectType | null;
    removeMachineFromProject?: IProjectType | null;
    updateProjectRepositories?: IProjectType | null;
    addProjectMember?: IUserType | null;
    removeProjectMember?: IUserType | null;
    deleteProject?: IProjectType | null;
    updateProjectTier?: IProjectType | null;
    createProjectTier?: IProjectTierType | null;
    updateProjectTierFields?: IProjectTierType | null;
    setDefaultProjectTier?: IProjectTierType | null;
    deleteProjectTier?: boolean | null;
    createUser?: IUserType | null;
    generateCustomToken?: IUserCustomTokenType | null;
    createFirebaseUser?: IUserType | null;
    updateProfile?: IUserType | null;
    setOnlineStatus?: IUserType | null;
    disableUser?: IUserType | null;
    enableUser?: IUserType | null;
    impersonateUser?: IUserCustomTokenType | null;
    createTeam?: ITeamType | null;
    deleteTeam?: ITeamType | null;
    generateCodeSession?: ISessionType | null;
    deleteSession?: ISessionType | null;
    revokeSession?: ISessionType | null;
    startSession?: ISessionType | null;
    stopSession?: ISessionType | null;
    generateCLIToken?: ICLITokenType | null;
    revokeCLIToken?: ICLITokenType | null;
    readNotification?: INotifications | null;
    createStackScript?: IStackscriptType | null;
    createLinode?: ILinodeInstanceType | null;
    deleteLinode?: ILinodeInstanceType | null;
    stopLinode?: ILinodeInstanceType | null;
    startLinode?: ILinodeInstanceType | null;
    executeRemoteVsCodeCommand?: IGenericReturn | null;
    removeRemoteVsCodeEvent?: IGenericReturn | null;
    startRemoteVsCodeEvent?: IGenericReturn | null;
    notifyMachineResult?: IGenericReturn | null;
    executeRemoteWorkerCommand?: IGenericReturn | null;
    newsLetterSubscription?: ISubscribeNewsLetter | null;
    updateFeatureFlag?: IFeatureFlag | null;
    createFeatureFlag?: IFeatureFlag | null;
    deleteFeatureFlag?: IFeatureFlag | null;
    createMyDomain?: IDomainType | null;
    deleteMyDomain?: IDomainType | null;
    deleteMyDomains?: IDomainType | null;
    setDeviceOptions?: IIotDeviceType | null;
    stopEmitValues?: IIotDeviceType | null;
    updateDevice?: IIotDeviceType | null;
    triggerRelay?: IIotTemperatureSensorType | null;
    createFlow?: IIotFlowType | null;
    setFlowArguments?: IIotFlowType | null;
    updateFlow?: IIotFlowType | null;
    /**
    description?: Add a new node to the knowledge graph.
          Use this to PROACTIVELY save useful information, especially?:
          1. **Code Snippets**?: If the user says "I like this code", save it as a 'CodeSnippet'.
          2. **Notes**?: General facts or preferences.
          3. **Concepts**?: Abstract ideas or definitions.

          Common labels?: CodeSnippet, Note, Concept, Document.
          IMPORTANT?: An 'id' (UUID) is automatically generated if not provided.
          Recommended?: Always provide a 'name' property for easier human-readable search.
          Auto-Embedding?: The content will be automatically embedded for vector search.
          
  */
    add_knowledge?: any | null;
    /**
    description?: Save a fact/snippet/preference to THIS PROJECT'S shared memory
          (visible to everyone with access to the project).
          Use this CONSERVATIVELY — only when the user explicitly asks to remember
          something, praises code YOU generated, or states a durable
          project-specific decision/preference clearly worth recalling later.
          ASK before saving unless the user already told you to. ALWAYS pass the
          projectId from your context. (Global knowledge is admin-only.)
  */
    save_project_memory?: any | null;
    /**
    description?: Edit/adjust an existing project memory entry by id. Use this to
          correct or refine something already saved (e.g. fix a fact, reword a
          note). Find the id first via list_project_memory or search_project_memory.
  */
    update_project_memory?: any | null;
    /**
    description?: Delete a project memory entry by id. This is DESTRUCTIVE —
          ALWAYS confirm with the user before calling it. Find the id first via
          list_project_memory or search_project_memory.
  */
    delete_project_memory?: any | null;
    /**
    description?: Create a relationship between two nodes in the knowledge graph.
          Use this to link concepts, e.g. (Company)-[?:OWNS]->(Website).
          Nodes are identified by their 'id' OR 'name' property.
          
  */
    create_relationship?: any | null;
    seed_lambda_docs?: any | null;
    addDocumentation?: IDocumentationNode | null;
    updateDocumentation?: IDocumentationNode | null;
    deleteDocumentation?: boolean | null;
    createChatAssistant?: IChat | null;
    sendChatAssistantMessage?: IChatMessage | null;
    createCompletionGemini?: ICreateCompletionGeminiType | null;
    createCompletionLambdasGemini?: ICreateCompletionGeminiType | null;
    stopChatRun?: IGenericReturn | null;
    setAiOptimizationConfig?: IAiOptimizationConfigType | null;
    createChat?: IChat | null;
    addChatMember?: IChat | null;
    removeChatMember?: IChat | null;
    deleteChat?: IChat | null;
    sendChatMessage?: IChatMessage | null;
    createAgent?: IAgent | null;
    updateAgent?: IAgent | null;
    deleteAgent?: boolean | null;
    spawnAgent?: ISpawnAgentResponse | null;
    createPaymentIntent?: ICreatePaymentIntent | null;
    createSetupIntent?: ICreateSetupIntent | null;
    setDefaultPaymentMethod?: ISetDefaultPaymentMethodResponse | null;
    createCompletion?: ICreateCompletionType | null;
    createChatCompletion?: ICreateCompletionType | null;
    migrateUp?: IProcessGenericType | null;
    migrateDown?: IProcessGenericType | null;
    backupDatabase?: IGraphqlFileType | null;
    restoreDatabase?: IGraphqlFileType | null;
    createEnvironment?: IFissionEnvironmentType | null;
    updateEnvironment?: IFissionEnvironmentType | null;
    updateEnvironmentByName?: IFissionEnvironmentType | null;
    deleteEnvironment?: IFissionEnvironmentType | null;
    deleteEnvironmentByName?: IFissionEnvironmentType | null;
    deleteAllEnvironments?: Array<IFissionEnvironmentType> | null;
    createMessageQueueTrigger?: IMessageQueueTrigger | null;
    updateMessageQueueTrigger?: IMessageQueueTrigger | null;
    deleteMessageQueueTrigger?: IMessageQueueTrigger | null;
    createLambdaTimeTrigger?: IFissionTimeTriggerType | null;
    deleteLambdaTimeTrigger?: IFissionTimeTriggerType | null;
    startLogStreaming?: IFissionLogsType | null;
    stopLogStreaming?: IFissionLogsType | null;
    openLambda?: IFissionType | null;
    closeLambda?: IFissionType | null;
    createLambda?: IFissionType | null;
    /**
    description?: 
        Updating lambda function 
        If you face this error?:
        "error updating function package resource version?: Operation cannot be fulfilled on functions.fission.io ""?: the object has been modified; please apply your changes to the latest version and try again"
        Try to update the function again and if it does not work delete and re-create it with the same payload
    
  */
    updateLambda?: IFissionType | null;
    deleteLambda?: IFissionType | null;
    rollbackLambda?: IFissionType | null;
    createConfigMap?: IKubectlConfig | null;
    updateConfigMap?: IKubectlConfig | null;
    updateConfigMapById?: IKubectlConfig | null;
    deleteConfigMap?: IKubectlConfig | null;
    createSecretMap?: IKubectlConfig | null;
    updateSecretMap?: IKubectlConfig | null;
    updateSecretMapById?: IKubectlConfig | null;
    deleteSecretMap?: IKubectlConfig | null;
    connectAtlasMongo?: IMongoAtlasConnector | null;
    updateAtlasMongo?: IMongoAtlasConnector | null;
    disconnectAtlasMongo?: IMongoAtlasConnector | null;
    installRabbitMq?: IRabbitMq | null;
    uninstallRabbitMq?: IRabbitMq | null;
    updateRabbitMq?: IRabbitMq | null;
    deleteQueue?: IRabbitMqQueue | null;
    declareQueue?: IRabbitMqQueue | null;
    createNamespace?: IKubectlNamespace | null;
    updateNamespaceResources?: IKubectlNamespace | null;
    suspendNamespace?: IKubectlNamespace | null;
    resumeNamespace?: IKubectlNamespace | null;
    deleteNamespace?: IKubectlNamespace | null;
    applyNetworkPolicy?: IKubectlNamespace | null;
    allowNamespaceAccess?: IKubectlNamespace | null;
    revokeNamespaceAccess?: IKubectlNamespace | null;
    deleteNetworkPolicy?: IKubectlNamespace | null;
    updateTierEntitlement?: IProjectEntitlement | null;
    setProjectEntitlementOverride?: IProjectEntitlement | null;
    removeProjectEntitlementOverride?: boolean | null;
    generateInvoice?: IInvoice | null;
    updateInvoiceStatus?: IInvoice | null;
    installPlugin?: IInstalledPlugin | null;
    uninstallPlugin?: string | null;
    provisionProjectCluster?: ICluster | null;
    teardownProjectCluster?: ICluster | null;
    updateProjectTierAdmin?: string | null;
    /**
    description?: Run JavaScript in a fresh, isolated, resource-limited QuickJS (WASM) sandbox and return its result, console output, timing and any error. Supports a per-run in-memory virtual filesystem (multi-file ES modules + node?:fs via options.files) and Programmatic Tool Calling via the awaitable `tools.*` namespace. Built for AI agents to write and verify code before deploying it. Stateless by default (nothing persisted between calls); with workspace persistence enabled, options.projectId + options.workdir target a durable server-side workspace instead (call the metadata query for the contract).
  */
    executeCode?: IExecutionResult | null;
    /**
    description?: Destroy an entire persistent workspace (all files + the marker), INCLUDING its published archives — except any archive a lambda currently deploys from, which survives as rollback history. Returns false when the workdir was already gone. Requires workspace persistence to be enabled.
  */
    deleteWorkspace?: boolean | null;
    /**
    description?: Mint a fresh, empty, persistent workspace directory for a project and return its random `workdir` name. Track that name in your conversation — files written under it survive across executeCode calls, pods and chat sessions (when the s3 backend is active). Requires workspace persistence to be enabled (WORKSPACE_PERSISTENCE=s3|memory); the default deployment is stateless.
  */
    createWorkdir?: IWorkdir | null;
    /**
    description?: Create or update one file in a persistent workspace without re-sending the rest of the project. Quota-limited per file and per workspace. Requires workspace persistence to be enabled.
  */
    writeFile?: IWorkspaceFile | null;
    /**
    description?: Delete one file from a persistent workspace; returns false when it did not exist. Requires workspace persistence to be enabled.
  */
    deleteFile?: boolean | null;
    /**
    description?: Zip a verified workspace as-is, upload it to the artifacts prefix, and mint the `customUploadFileId` the lambda-creation flow deploys verbatim. Requires the "s3" persistence backend.
  */
    publishProject?: IPublishedProjectArtifact | null;
    /**
    description?: Import a DEPLOYED lambda into a workspace so you can edit it and re-publish — the inverse of publishProject. Handles BOTH kinds?: an archive lambda (customUploadFileId .zip) is unzipped; a regular code lambda is virtualized as index.js/package.json/build.sh from its code/packageJson/buildBashScript fields. The returned `source` says which. Give lambdaName (from listLambdas) or fileId; omit workdir for a fresh one. Then edit with writeFile/executeCode and publishProject for a new customUploadFileId. Requires the "s3" persistence backend.
  */
    importLambda?: IImportedLambda | null;
    /**
    description?: Save a plan as a durable document (a `file` doc under plans/<projectId>/, related to the chat). Defaults to status 'draft'. Returns the plan summary (no content). Requires the "s3" persistence backend.
  */
    savePlan?: IPlan | null;
    /**
    description?: Update a saved plan's content, title and/or status (at least one). A content change bumps its version; set status to 'feature' to save it as a feature. Scoped to the project. Requires the "s3" persistence backend.
  */
    updatePlan?: IPlan | null;
    /**
    description?: Delete a saved plan by id. Removes the S3 object and the Mongo `file` document. Scoped to the project. Requires the "s3" persistence backend.
  */
    deletePlan?: boolean | null;
}

  
  export interface IBraintreeTransactionPayload {
    amount?: string | null;
    nonce?: string | null;
    deviceData?: string | null;
}

  
  export interface IBraintreeTransactionType {
    __typename?: "BraintreeTransactionType";
    id?: string | null;
    status?: string | null;
    type?: string | null;
    currencyIsoCode?: string | null;
    amount?: string | null;
    merchantAccountId?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    refundIds?: Array<string> | null;
    settlementBatchId?: string | null;
    processorAuthorizationCode?: string | null;
    processorResponseCode?: string | null;
    processorResponseText?: string | null;
    avsPostalCodeResponseCode?: string | null;
    avsStreetAddressResponseCode?: string | null;
    cvvResponseCode?: string | null;
    refundedTransactionId?: string | null;
    customer?: IBraintreeCustomerType | null;
    billing?: IBrainTreeBillingType | null;
    creditCard?: IBrainTreeCreditCardType | null;
}

  
  export interface IBraintreeCustomerType {
    __typename?: "BraintreeCustomerType";
    id?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    email?: string | null;
    website?: string | null;
    phone?: string | null;
    fax?: string | null;
}

  
  export interface IBrainTreeBillingType {
    __typename?: "BrainTreeBillingType";
    id?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    streetAddress?: string | null;
    extendedAddress?: string | null;
    locality?: string | null;
    region?: string | null;
    postalCode?: string | null;
    countryName?: string | null;
    countryCodeAlpha2?: string | null;
    countryCodeAlpha3?: string | null;
    countryCodeNumeric?: string | null;
}

  
  export interface IBrainTreeCreditCardType {
    __typename?: "BrainTreeCreditCardType";
    bin?: string | null;
    last4?: string | null;
    cardType?: string | null;
    expirationDate?: string | null;
    expirationMonth?: string | null;
    expirationYear?: string | null;
    customerLocation?: string | null;
    cardholderName?: string | null;
    imageUrl?: string | null;
    prepaid?: string | null;
    healthcare?: string | null;
    debit?: string | null;
    durbinRegulated?: string | null;
    commercial?: string | null;
    payroll?: string | null;
    issuingBank?: string | null;
    countryOfIssuance?: string | null;
    maskedNumber?: string | null;
}

  
  export interface IBraintreeClientToken {
    __typename?: "BraintreeClientToken";
    clientToken?: string | null;
}

  
  export interface ICardInputType {
    title?: string | null;
    description?: string | null;
    dueDate?: string | null;
    order?: number | null;
    backlogOrder?: number | null;
    dueDateComplete?: string | null;
    members?: Array<IUserInputType> | null;
    labels?: Array<string> | null;
    pullRequest?: string | null;
}

  
  export interface IUserInputType {
    id?: string | null;
    email?: string | null;
    displayName?: string | null;
    signInMethod?: string | null;
    additionalUserInfo?: IUserTypeAdditionalInfoInput | null;
    user_id?: string | null;
}

  
  export interface IUserTypeAdditionalInfoInput {
    isNewUser?: boolean | null;
    providerId?: string | null;
    profile?: IUserTypeProfileSchema | null;
    username?: boolean | null;
}

  
  export interface IUserTypeProfileSchema {
    avatar_url?: string | null;
    bio?: string | null;
    blog?: string | null;
    company?: string | null;
    created_at?: string | null;
    email?: string | null;
    events_url?: string | null;
    followers?: string | null;
    followers_url?: string | null;
    following?: string | null;
    following_url?: string | null;
    gists_url?: string | null;
    gravatar_id?: string | null;
    hireable?: string | null;
    html_url?: string | null;
    id?: string | null;
    location?: string | null;
    login?: string | null;
    name?: string | null;
    node_id?: string | null;
    organizations_url?: string | null;
    public_gists?: string | null;
    public_repos?: string | null;
    received_events_url?: string | null;
    repos_url?: string | null;
    site_admin?: string | null;
    starred_url?: string | null;
    subscriptions_url?: string | null;
    updated_at?: string | null;
    type?: string | null;
    url?: string | null;
}

export   
  type IUpdateCardEventEnumEnum = 'add_member' | 'update_pull_request' | 'update_duedate' | 'update_description' | 'update_title' | 'remove_label' | 'add_label' | 'remove_member' | 'change_column';

  
  export interface IFile {
    __typename?: "File";
    filename?: string | null;
    mimetype?: string | null;
    encoding?: string | null;
}

  
  export interface IBoardColumnInputType {
    name?: string;
}

  
  export interface IBoardInputType {
    name: string;
    columns?: Array<string> | null;
    restricted?: boolean | null;
    members?: Array<string> | null;
    labels?: Array<string> | null;
}

  
  export interface IRepositoryInputType {
    description?: string | null;
    owner?: string | null;
    name?: string | null;
    url?: string | null;
    sshUrl?: string | null;
}

  
  export interface IProjectTierInput {
    name: string;
    price?: number | null;
    currency?: string | null;
    description?: string | null;
    isDefault?: boolean | null;
    quotas?: IProjectTierQuotasInput | null;
    limits?: IProjectTierLimitsInput | null;
}

  
  export interface IProjectTierQuotasInput {
    pods?: string | null;
    services?: string | null;
    configmaps?: string | null;
    secrets?: string | null;
    requestsCpu?: string | null;
    requestsMemory?: string | null;
    limitsCpu?: string | null;
    limitsMemory?: string | null;
}

  
  export interface IProjectTierLimitsInput {
    container?: IProjectTierContainerLimitsInput | null;
}

  
  export interface IProjectTierContainerLimitsInput {
    maxCpu?: string | null;
    maxMemory?: string | null;
    defaultCpu?: string | null;
    defaultMemory?: string | null;
    defaultRequestCpu?: string | null;
    defaultRequestMemory?: string | null;
}

  
  export interface IProjectTierUpdateInput {
    name?: string | null;
    price?: number | null;
    currency?: string | null;
    description?: string | null;
    isDefault?: boolean | null;
    quotas?: IProjectTierQuotasInput | null;
    limits?: IProjectTierLimitsInput | null;
}

  
  export interface IUserCustomTokenType {
    __typename?: "UserCustomTokenType";
    /**
    description?: This token expires 1 hour after creation
  */
    token?: string | null;
}

  
  export interface ICreateUserInputType {
    photoURL?: string;
}

  
  export interface IUpdateProfileType {
    photoURL?: string;
}

  
  export interface ICLITokenType {
    __typename?: "CLITokenType";
    id?: string | null;
    token?: string | null;
    user_id?: string | null;
    active?: boolean | null;
}

  
  export interface IStackcsriptInputType {
    label: string;
    description?: string | null;
    is_public?: boolean | null;
    rev_note?: string | null;
    script?: Array<string> | null;
    images: Array<string>;
}

  
  export interface ILinodeCreateInstanceInputType {
    backup_id?: number | null;
    backups_enabled?: boolean | null;
    swap_size?: number | null;
    type: string;
    region: string;
    image: string;
    root_pass: string;
    authorized_keys?: Array<string> | null;
    stackscript_id?: number | null;
    stackscript_data: ILinodeCreateInstanceInputStackScriptData;
    booted?: boolean | null;
    label?: string | null;
    tags?: Array<string> | null;
    group?: string | null;
    private_ip?: boolean | null;
    authorized_users?: Array<string> | null;
}

  
  export interface ILinodeCreateInstanceInputStackScriptData {
    unique_label?: string;
}

export   
  type IInstanceCommandsEnum = 'START_VS_CODE' | 'REMOVE_VS_CODE' | 'CLONE_PROJECT' | 'REMOVE_PROJECT';

  
  export interface IGenericReturn {
    __typename?: "GenericReturn";
    status?: string | null;
}

  
  export interface IRemoveVsCodeInputArguments {
    specifier?: string;
}

  
  export interface IStartVsCodePayload {
    specifier: string;
    password: string;
    folder: string;
    ports: Array<string>;
    image?: string | null;
    graphqlServerJson?: string | null;
    vsCodeSyncLocalSettings?: string | null;
    vsCodeSettings?: string | null;
}

export   
  type IWorkerCommandsEnum = 'GIT' | 'NPM' | 'DOCKER' | 'DOCKER_COMPOSE' | 'MKDIR' | 'CHMOD' | 'NGINX_RESTART' | 'NGINX_GENERATE_CONFIG' | 'NGINX_SAVE_CONFIG' | 'NGINX_REMOVE_CONFIG';

  
  export interface IFeatureFlagPayload {
    name?: string | null;
    description?: string | null;
    settings?: IFeatureFlagSettingsPayload | null;
}

  
  export interface IFeatureFlagSettingsPayload {
    enabled?: boolean | null;
    components?: Array<string> | null;
}

  
  export interface IUpdateDeviceInputPayload {
    debug?: boolean;
}

  
  export interface IIotTemperatureSensorType {
    __typename?: "IotTemperatureSensorType";
    id?: string | null;
    serial?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    data?: Array<IIotTemperatureSensorData> | null;
}

  
  export interface IIotFlowPayloadType {
    code: string;
    args?: any | null;
    device: string;
    enabled?: boolean | null;
}

  
  export interface ILambdaDocChunkInput {
    name: string;
    title: string;
    content: string;
    category?: string | null;
    keywords?: string | null;
    relatedTo?: Array<string> | null;
}

  
  export interface IChatPayload {
    name: string;
    participants?: Array<string> | null;
    projectId?: string | null;
}

  
  export interface IChatMessagePayload {
    chatId?: string | null;
    content?: string | null;
    model?: string | null;
    attachments?: Array<string> | null;
    revertMessageId?: string | null;
    agentType?: string | null;
}

  
  export interface ICreateCompletionInputType {
    /**
    description: ID of the model to use. You can use the [List models](https://platform.openai.com/docs/api-reference/models/list) API to see all of your available models, or see our [Model overview](/docs/models/overview) for descriptions of them.
  */
    model: string;
    prompt: string;
    /**
    description: The maximum number of [tokens](/tokenizer) to generate in the completion.  The token count of your prompt plus `max_tokens` cannot exceed the model's context length. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
  */
    max_tokens?: number | null;
    /**
    description: The suffix that comes after a completion of inserted text.
  */
    suffix?: string | null;
    /**
    description: What [sampling temperature](https://towardsdatascience.com/how-to-sample-from-language-models-682bceb97277) to use. Higher values means the model will take more risks. Try 0.9 for more creative applications, and 0 (argmax sampling) for ones with a well-defined answer.  We generally recommend altering this or `top_p` but not both.
  */
    temperature?: number | null;
    /**
    description: An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.  We generally recommend altering this or `temperature` but not both.
  */
    top_p?: number | null;
    /**
    description: How many completions to generate for each prompt.  **Note:** Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for `max_tokens` and `stop`.
  */
    n?: number | null;
    /**
    description: Include the log probabilities on the `logprobs` most likely tokens, as well the chosen tokens. For example, if `logprobs` is 5, the API will return a list of the 5 most likely tokens. The API will always return the `logprob` of the sampled token, so there may be up to `logprobs+1` elements in the response.  The maximum value for `logprobs` is 5. If you need more than this, please contact us through our [Help center](https://help.openai.com) and describe your use case.
  */
    logprobs?: string | null;
    /**
    description: Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.  [See more information about frequency and presence penalties.](https://platform.openai.com/docs/api-reference/parameter-details)
  */
    presence_penalty?: number | null;
    /**
    description: Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.  [See more information about frequency and presence penalties.](https://platform.openai.com/docs/api-reference/parameter-details)
  */
    frequency_penalty?: number | null;
    /**
    description: Generates `best_of` completions server-side and returns the "best" (the one with the highest log probability per token). Results cannot be streamed.  When used with `n`, `best_of` controls the number of candidate completions and `n` specifies how many to return – `best_of` must be greater than `n`.  **Note:** Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for `max_tokens` and `stop`.
  */
    best_of?: number | null;
}

  
  export interface ICreateCompletionGeminiType {
    __typename?: "CreateCompletionGeminiType";
    candidates?: Array<ICandidate> | null;
    usageMetadata?: IUsageMetadata | null;
    modelVersion?: string | null;
    responseId?: string | null;
}

  
  export interface ICandidate {
    __typename?: "Candidate";
    content?: IContent | null;
    finishReason?: string | null;
    avgLogprobs?: number | null;
}

  
  export interface IContent {
    __typename?: "Content";
    parts?: Array<IContentParts> | null;
    role?: string | null;
}

  
  export interface IContentParts {
    __typename?: "ContentParts";
    text?: string | null;
}

  
  export interface IUsageMetadata {
    __typename?: "UsageMetadata";
    promptTokenCount?: number | null;
    candidatesTokenCount?: number | null;
    totalTokenCount?: number | null;
    promptTokensDetails?: Array<ITokenDetail> | null;
    candidatesTokensDetails?: Array<ITokenDetail> | null;
}

  
  export interface ITokenDetail {
    __typename?: "TokenDetail";
    token?: string | null;
    logprob?: number | null;
}

  
  export interface IAiOptimizationConfigInputType {
    limitHistoryCount?: number | null;
    stripToolDescriptions?: boolean | null;
    truncateToolDescriptions?: boolean | null;
    simplifySchemas?: boolean | null;
    outputSchemaForTools?: boolean | null;
    enableContextCaching?: boolean | null;
}

  
  export interface IAiOptimizationConfigType {
    __typename?: "AiOptimizationConfigType";
    limitHistoryCount?: number | null;
    stripToolDescriptions?: boolean | null;
    truncateToolDescriptions?: boolean | null;
    simplifySchemas?: boolean | null;
    outputSchemaForTools?: boolean | null;
    enableContextCaching?: boolean | null;
}

  
  export interface ICreateAgentInput {
    /**
    description: Human-readable agent name
  */
    name: string;
    /**
    description: Agent type slug — uppercase identifier (letters, digits, underscores), e.g. LAMBDA, PLAN, CHAT, AUTO, FINANCE, PLUGINS, MQ, TIME_TRIGGERS
  */
    type: string;
    /**
    description: One-line summary of what this agent specializes in — shown in the chat mode selector and used by the AUTO orchestrator
  */
    description?: string | null;
    /**
    description: System prompt / instructions for the agent
  */
    instructions: string;
    /**
    description: List of MCP tool names available to this agent
  */
    tools?: Array<string> | null;
    /**
    description: Whether the agent is active
  */
    isActive?: boolean | null;
    /**
    description: Optional AI model override
  */
    modelName?: string | null;
}

  
  export interface IUpdateAgentInput {
    /**
    description: Human-readable agent name
  */
    name?: string | null;
    /**
    description: Agent type slug — uppercase identifier (letters, digits, underscores), e.g. LAMBDA, PLAN, CHAT, AUTO, FINANCE, PLUGINS, MQ, TIME_TRIGGERS
  */
    type?: string | null;
    /**
    description: One-line summary of what this agent specializes in
  */
    description?: string | null;
    /**
    description: System prompt / instructions for the agent
  */
    instructions?: string | null;
    /**
    description: List of MCP tool names available to this agent
  */
    tools?: Array<string> | null;
    /**
    description: Whether the agent is active
  */
    isActive?: boolean | null;
    /**
    description: Optional AI model override
  */
    modelName?: string | null;
}

  
  export interface ISpawnAgentInput {
    /**
    description: The chat conversation ID this sub-agent belongs to
  */
    chatId: string;
    /**
    description: The task instructions for the sub-agent
  */
    prompt: string;
    /**
    description: Agent type slug of the worker to provision (e.g. LAMBDA, PLAN, CHAT, FINANCE). The set is admin-managed and dynamic — your instructions list the currently available worker types; only use types from that list
  */
    type: string;
    /**
    description: AI model id for this sub-agent. Pass your own currentModel (from your context) so the worker runs on the same model you do; the worker's own configured model, if an admin set one, overrides this. Never guess or invent model ids — only forward your currentModel
  */
    model?: string | null;
    /**
    description: Links the sub-agent result back to the triggering message
  */
    parentMessageId?: string | null;
}

  
  export interface ISpawnAgentResponse {
    __typename?: "SpawnAgentResponse";
    /**
    description?: Chat conversation ID
  */
    chatId?: string | null;
    /**
    description?: Unique task identifier for the spawned agent
  */
    taskId?: string | null;
    /**
    description?: Message ID of the sub-agent response
  */
    messageId?: string | null;
    /**
    description?: Task status?: completed, cancelled, or error
  */
    status?: string | null;
    /**
    description?: Result summary from the sub-agent
  */
    summary?: string | null;
}

  
  export interface ICreatePaymentIntent {
    __typename?: "CreatePaymentIntent";
    clientSecret?: string | null;
    status?: string | null;
}

  
  export interface ICreateSetupIntent {
    __typename?: "CreateSetupIntent";
    clientSecret?: string | null;
    status?: string | null;
}

  
  export interface ISetDefaultPaymentMethodResponse {
    __typename?: "SetDefaultPaymentMethodResponse";
    success?: boolean | null;
}

  
  export interface ICreateCompletionType {
    __typename?: "CreateCompletionType";
    id?: string | null;
    object?: string | null;
    created?: number | null;
    model?: string | null;
    choices?: Array<ICreateCompletionChoicesType> | null;
    usage?: ICreateCompletionUsageType | null;
}

  
  export interface ICreateCompletionChoicesType {
    __typename?: "CreateCompletionChoicesType";
    /**
    description?: This property can be defined using createCompletion method
  */
    text?: string | null;
    /**
    description?: This property can be defined using createChatCompletion method
  */
    message?: ICreateChatCompletionMessageType | null;
    index?: string | null;
    logprobs?: string | null;
    finish_reason?: string | null;
}

  
  export interface ICreateChatCompletionMessageType {
    __typename?: "CreateChatCompletionMessageType";
    role?: string | null;
    content?: string | null;
}

  
  export interface ICreateCompletionUsageType {
    __typename?: "CreateCompletionUsageType";
    prompt_tokens?: number | null;
    completion_tokens?: number | null;
    total_tokens?: number | null;
}

  
  export interface IGraphqlFileType {
    __typename?: "GraphqlFileType";
    id?: string | null;
    url?: string | null;
    metadata?: IFileMetadata | null;
    amazonMetadata?: IFileAmazonMetadata | null;
}

  
  export interface IFissionEnvironmentInputType {
    /**
    description: Default environment name is "nodejs"
  */
    name?: string | null;
    /**
    description: Default image is "rxdi/fission-node:0.0.14"
  */
    image?: string | null;
    /**
    description: Default builder image is "rxdi/fission-node-builder:1.0.5"
  */
    builder?: string | null;
    /**
    description: Default poolSize is 3
  */
    poolSize?: number | null;
    /**
    description: Hard cap on the TOTAL number of "poolmgr" pods for this environment (warm pool + all specialized function pods). At the cap the executor refuses to specialize a new pod (HTTP 429), preventing an invocation flood (e.g. KEDA) from provisioning unbounded pods. 0 (default) means unlimited; only applies to "poolmgr"; should be >= poolSize
  */
    maxPods?: number | null;
    /**
    description: Maximum number of builder pods for this environment. Builder pods are provisioned on demand (one per concurrent build) up to this cap, then scaled back to zero when idle. Building one lambda uses one pod regardless of this value. Default is 1
  */
    builderPoolSize?: number | null;
    /**
    description: Builds a single builder pod will accept (MAX_PARALLEL_BUILDS). Default is 1 (one build per pod); independent of builderPoolSize
  */
    builderMaxParallelBuilds?: number | null;
    /**
    description: Seconds a builder pod stays up after its last build before scaling to zero. 0 = never scale down. Default is 600 (10 minutes)
  */
    builderIdleTimeout?: number | null;
    /**
    description: Default maxCpu is 500
  */
    maxCpu?: number | null;
    /**
    description: Default maxMemory is 192
  */
    maxMemory?: number | null;
    /**
    description: Default minCpu is 30
  */
    minCpu?: number | null;
    /**
    description: Default min memory is 64
  */
    minMemory?: number | null;
    /**
    description: Default region is eu-central
  */
    region?: IEnvironmentRegionEnum | null;
    /**
    description: The private cluster this environment should run on; omit for the shared cluster. Immutable after creation.
  */
    clusterId?: string | null;
}


  export interface IMessageQueueTriggerInput {
    name?: string | null;
    lambdaName?: string | null;
    requestTopic?: string | null;
    responseTopic?: string | null;
    errorTopic?: string | null;
    maxRetries?: number | null;
    coolDownPeriod?: number | null;
    pollingInterval?: number | null;
    minReplicaCount?: number | null;
    maxReplicaCount?: number | null;
    threshold?: number | null;
}

  
  export interface ICreateTimeTriggerInput {
    /**
    description?: Lambda ID in mongo ObjectId
  */
    lambdaId?: string;
    /**
    description?: Name representing the time trigger can be anything rememberable
  */
    triggerName?: string;
    /**
    description?: 
        This is cronjob aka time trigger attached to the lambda 
        Especially usefull if you want to create a recurrent jobs like 
        Do this in @every hour or do this @daily or @monthly or @weekly

        @yearly | Once a year, midnight, Jan. 1st |0 0 0 1 1 *|
        @monthly| Once a month, midnight, first of month |0 0 0 1 * *|
        @weekly | Once a week, midnight between Sat/Sun |0 0 0 * * 0|
        @daily | Once a day, midnight |0 0 0 * * *|
        @hourly | Once an hour, beginning of hour |0 0 * * * *|

        Example "@every 1h30m10s"
        Example "@every 1m"
        Example "@daily"
        
  */
    cron?: string;
}

  
  export interface ICreateOrUpdateLambdaInput {
    /**
    description: Name of the lambda function it can be for example "my-lambda-function" 
  */
    name: string;
    /**
    description: Route on which lambda will be served for example it can be the same as name of the lambda "my-lambda-function"
  */
    route?: string | null;
    /**
    description: 
        Every project can have lambdas but we need to register them as part of the project 
        Project mapped to this specific lambda function
        
  */
    projectId: string;
    /**
    description: JavaScript/Node.js source for the lambda handler, e.g. "export default async function (context) { ... }".
The full @gapi/core code examples, the LambdaContext export interface, and the GraphQL federation gateway setup are NOT inlined here (they bloat every request). Retrieve them on demand via the knowledge search tool, e.g. search_knowledge_vector("lambda code example") or search_knowledge_vector("graphql federation gateway"), before writing lambda code.
  */
    code?: string | null;
    /**
    description: List of kubernetes secret names
  */
    secrets?: Array<string> | null;
    /**
    description: List of kubernetes config names
  */
    configs?: Array<string> | null;
    /**
    description: 
  When we create lambdas we define parameters here as a array ['id', 'name'] 
  and we can execute /my-lambda/{id}/{name}
  
  */
    params?: Array<string> | null;
    /**
    description: The environment in which this lambda will execute defaults to "nodejs" available only "nodejs" at this moment
  */
    env?: string | null;
    /**
    description: 
  # envSecrets (read by the nodejs-graphql runtime BEFORE the bundle loads)
  # projects all keys of these mounted secrets into process.env, so the existing
  # process.env-based ENVIRONMENT (src/app/app.constants.ts) works unchanged.
  currently only usable in graphql environment
        
  */
    envSecrets?: Array<string> | null;
    /**
    description: Can be one of the http methods GET,POST,UPDATE,DELETE,PUT defaults to GET if not defined
  */
    method?: Array<IHttpMethodsEnum> | null;
    /**
    description: Can be defined as json object in string like this "{"dependencies":{}}"
  */
    packageJson?: string | null;
    /**
    description: This is the script which will be executed on build job before lambda initialization

**** START SCRIPT ****
#!/bin/sh
cd ${SRC_PKG}

npm install

mv index.js index.ts
npx @gapi/gcli build

rm -rf node_modules
cp -r ${SRC_PKG} ${DEPLOY_PKG}
**** END SCRIPT ****

        It can be null and it will build the function automatically with the script above
        This is just for reference so we can learn how to structure buildBashScript
      
  */
    buildBashScript?: string | null;
    /**
    description: 
      This is handled by the @gapi/gcli npm library and we can upload whole archive in S3 Amazon
      This archive will be then fetched by the function and used
      The idea is that we can deploy using CI/CD and we can bundle our code to a single index.js file
      And then this code will be used to initiate the lambda creation
      
  */
    customUploadFileId?: string | null;
    /**
    description: This field can be left null since it will default to specific values
  */
    scaleOptions?: ILambdaScaleInputOptions | null;
    /**
    description: Disable external traffic to hit the lambda function using http
  */
    network?: Array<string> | null;
    /**
    description: 
        When "true" this lambda is provisioned as an Graphql Federation gateway instead of a
        regular function. The selected "subgraphs" are composed into a single supergraph and the
        exported "code" function is executed before every request to build the gateway context
        (authentication). The "env" must point to the federation runtime image.
      
  */
    federation?: boolean | null;
    /**
    description: 
        Only used when "federation" is true. List of lambda names (within the same project) to expose
        as subgraphs of the federation gateway. The backend resolves each name to its internal router
        URL and generates the GATEWAY_SERVICE_LIST consumed by the gateway.
      
  */
    subgraphs?: Array<string> | null;
    /**
    description: 
        When "true" this lambda is provisioned as an Apollo MCP Server in front of a federation graph
        instead of a regular function. The selected "mcpGraph" is resolved to its internal router URL,
        its schema is introspected (single source of truth) and the "mcpOperations" are exposed as MCP
        tools. The "env" must point to the MCP runtime image.
      
  */
    mcp?: boolean | null;
    /**
    description: 
        Only used when "mcp" is true. Name of the federation gateway lambda (within the same project)
        the MCP server connects to. The backend resolves it to its internal router URL and stores it as
        MCP_ENDPOINT in the auto-managed <lambda>-mcp secret.
      
  */
    mcpGraph?: string | null;
    /**
    description: 
        Only used when "mcp" is true. Curated GraphQL operations exposed as MCP tools. Stored in the
        auto-managed <lambda>-mcp-operations ConfigMap and mounted into the MCP runtime. Optional — the
        introspection/search/execute tools work without any curated operations.
      
  */
    mcpOperations?: Array<IMcpOperationInput> | null;
    /**
    description: 
        Only used when "mcp" is true. Additional request headers the MCP server forwards from the caller
        to the federation endpoint. "Authorization" is ALWAYS forwarded; list extra headers here.
      
  */
    mcpForwardHeaders?: Array<IMcpForwardHeaderInput> | null;
    /**
    description: 
        Only used when "mcp" is true. Static headers added to every request the MCP server makes to the
        federation endpoint (e.g. a fixed API key / service token). Stored in the <lambda>-mcp secret and
        rendered as Apollo "headers:". Distinct from mcpForwardHeaders, which forward the caller's headers.
      
  */
    mcpHeaders?: Array<IMcpHeaderInput> | null;
    /**
    description: Enable Cloudflare CDN caching for this lambda. When enabled, responses will be cached at Cloudflare's edge network, reducing origin requests and improving latency for repeated requests.
  */
    cache?: boolean | null;
}

  
  export interface ILambdaScaleInputOptions {
    /**
    description: 
    Minimum CPU to be assigned to pod (In millicore, minimum 1) usable in "newdeploy"
    
  */
    minCpu?: number | null;
    /**
    description: 
    Maximum CPU to be assigned to pod (In millicore, minimum 1) usable in "newdeploy"
    
  */
    maxCpu?: number | null;
    /**
    description: 
    Minimum memory to be assigned to pod (In megabyte) usable in "newdeploy"
    
  */
    minMemory?: number | null;
    /**
    description: 
    Maximum memory to be assigned to pod (In megabyte) usable in "newdeploy"
    
  */
    maxMemory?: number | null;
    /**
    description: 
    Minimum number of pods (Uses resource inputs to configure HPA) usable in "newdeploy"
    
  */
    minScale?: number | null;
    /**
    description: 
    Maximum number of pods (Uses resource inputs to configure HPA) usable in "newdeploy"
    
  */
    maxScale?: number | null;
    /**
    description: 
      Target average CPU usage percentage across pods for scaling usable in "newdeploy"
    
  */
    targetCpu?: number | null;
    /**
    description: 
      Executor type for execution; one of 'poolmgr', 'newdeploy' it defaults to "poolmgr"
    
  */
    executorType?: ILambdaScaleOptionsExecutorTypeEnum | null;
    /**
    description: 
      The length of time (in seconds) that a function is idle before pod(s) are eligible for recycling
    
  */
    idleTimeout?: number | null;
    /**
    description: 
      Maximum number of pods specialized concurrently to serve (Only valid for executortype; "poolmgr")
    
  */
    concurrency?: number | null;
    /**
    description: 
      Maximum time for a request to wait for the response from the function
    
  */
    functionTimeout?: number | null;
    /**
    description: 
      Timeout for executor to wait for function pod creation
    
  */
    specializationTimeout?: number | null;
    /**
    description: 
     	The Warm Oven: Keeps specific "Ready" pods alive so the first user doesn't wait (Cold Start).
      Even if nobody is using the function, keep X number of warm pods alive in the cluster prepared and ready to go.
    
  */
    retainPods?: number | null;
    /**
    description: 
      Maximum number of concurrent requests that can be served by a specialized pod (Only valid for executortype; "poolmgr")
    
  */
    requestsPerPod?: number | null;
}

  
  export interface IMcpOperationInput {
    /**
    description: The named GraphQL operation document exposed as an MCP tool, e.g. "query GetUser($id: ID!) { … }". The operation name becomes the tool name.
  */
    query: string;
    /**
    description: Optional. Derived from the operation name in "query" when omitted; used as the .graphql file name.
  */
    name?: string | null;
}

  
  export interface IMcpForwardHeaderInput {
    /**
    description?: Header name forwarded from the incoming request, e.g. "X-Tenant-Id".
  */
    name?: string;
}

  
  export interface IMcpHeaderInput {
    /**
    description?: Header name, e.g. "X-Api-Key" or "Authorization".
  */
    name?: string;
    /**
    description?: Header value sent verbatim to the endpoint.
  */
    value?: string;
}

  
  export interface IDeleteLambdaInput {
    name?: string;
    projectId?: string;
}

  
  export interface IGenericKubectConfig {
    /**
    description?: Name of the kubernetes secret it can be "envirnoment" or any other but follow "my-environment" pattern for creating names
  */
    name?: string;
    /**
    description?: Project mapped to this specific lambda function
  */
    projectId?: string;
    /**
    description?: Key value pari mapped to this config or secret
        returns JSON string like this?:
        {
        "MY_SECRET"?:"first",
        "MY_SECRET_SECOND"?:"second",
        "MY_SECRET_THIRD"?:"third"
        }
      
  */
    pairs?: any;
}

  
  export interface IMongoAtlasConnectPayload {
    connectorName: string;
    atlasProjectName: string;
    orgId: string;
    privateApiKey: string;
    publicApiKey: string;
    allowedIps?: Array<IMongoAtlasConnectorAllowedIpsInput> | null;
}

  
  export interface IMongoAtlasConnectorAllowedIpsInput {
    ip?: string;
    description?: string;
}

  
  export interface IMongoAtlasDatabaseOptionsInput {
    dbName?: string;
    dbUser?: string;
}

  
  export interface IRabbitMqInstallPayload {
    description?: string | null;
    name: string;
    user: string;
    password: string;
    region: IEnvironmentRegionEnum;
    storage?: IRabbitMqStorageInput | null;
    queues?: Array<IRabbitMqInputQueue> | null;
    /** Which private cluster to provision this broker on; omit for the shared cluster. */
    clusterId?: string | null;
}

  
  export interface IRabbitMqStorageInput {
    enabled?: boolean | null;
    size?: IRabbitMqStorageSizeEnum | null;
}

  
  export interface IRabbitMqInputQueue {
    name?: string | null;
    vhost?: string | null;
    durable?: boolean | null;
    auto_delete?: boolean | null;
}

  
  export interface IRabbitMqDefinitionsPayload {
    queues?: Array<IRabbitMqInputQueue> | null;
}

  
  export interface IKubectlNamespace {
    __typename?: "KubectlNamespace";
    projectId?: string | null;
}

  /**
    description?: Outcome of one sandboxed code execution?: the returned value, captured console output, timing, and any error.
  */
  export interface IExecutionResult {
    __typename?: "ExecutionResult";
    /**
    description?: True when the code ran to completion; false when it threw, failed to compile, or hit the time/memory limit.
  */
    success?: boolean;
    /**
    description?: The value the code returned, as native JSON (number, string, boolean, object, array or null). Null when the code did not `return` anything, or on failure. Non-serializable values (functions, undefined, symbols, BigInt) appear as null.
  */
    result?: any | null;
    /**
    description?: When `success` is false, `{ name, message, stack? }` describing what went wrong (e.g. a thrown error, a SyntaxError, or `interrupted` on timeout).
  */
    error?: any | null;
    /**
    description?: Everything the sandbox wrote to console.{log,info,warn,error,debug}, in order, each line prefixed with its level.
  */
    logs?: Array<string>;
    /**
    description?: Wall-clock duration of the run in milliseconds (includes time spent awaiting host tool calls).
  */
    executionTimeMs?: number | null;
    /**
    description?: Project mode only (when `options.files` was provided)?: a `{ path?: content }` map of the virtual filesystem after the run — every file present at the end, including ones the code wrote via `node?:fs`. Null in snippet mode. The filesystem is in-memory and discarded after the run; this snapshot is the only way to read back what the code produced. In workspace mode (options.projectId + options.workdir) this is instead the DELTA?: only files the run created or modified relative to the workspace.
  */
    changedFiles?: any | null;
    /**
    description?: True when the `changedFiles` snapshot hit the operator byte ceiling and files were dropped from it — treat the map as incomplete, never as evidence a missing file was deleted.
  */
    changedFilesTruncated?: boolean | null;
    /**
    description?: Workspace mode only (options.projectId + options.workdir with persistence enabled)?: `{ projectId, workdir, persistedFiles?: [path], deletedFiles?: [path], skippedDeletionCheck?: boolean }` describing what was written back to durable storage after the run. Null in stateless runs.
  */
    persistence?: any | null;
}

  /**
    description?: A freshly minted workspace directory. Track the `workdir` name in your chat history — every later call (listFiles/getFile/writeFile/deleteFile/executeCode/publishProject) targets the workspace by projectId + workdir, from any session.
  */
  export interface IWorkdir {
    __typename?: "Workdir";
    projectId?: string;
    /**
    description?: Random directory name, e.g. "ws-1f2e3d4c5b6a7089".
  */
    workdir?: string;
    createdAt?: string | null;
    /**
    description?: Which persistence backend minted it?: "s3" (durable) or "memory" (single-pod dev/test backend — NOT durable across pods or restarts).
  */
    backend?: string | null;
}

  /**
    description?: A workspace zipped and registered as a deployable archive. Pass `customUploadFileId` to the lambda-creation flow to deploy it as-is.
  */
  export interface IPublishedProjectArtifact {
    __typename?: "PublishedProjectArtifact";
    /**
    description?: Mongo `file` document id the lambda-creation flow accepts as customUploadFileId.
  */
    customUploadFileId?: string;
    /**
    description?: S3 object key of the uploaded zip.
  */
    key?: string;
    bucket?: string | null;
    /**
    description?: Zip size in bytes.
  */
    bytes?: number | null;
    /**
    description?: SHA-256 of the zip.
  */
    sha256?: string | null;
    /**
    description?: Number of files archived.
  */
    files?: number | null;
}

  /**
    description?: A DEPLOYED lambda archive fetched from S3 and unzipped into a workspace, ready to edit and re-publish (the inverse of publishProject). Track `workdir` — edit files with writeFile/executeCode, then publishProject(projectId, workdir, lambdaName) to mint a new customUploadFileId.
  */
  export interface IImportedLambda {
    __typename?: "ImportedLambda";
    projectId?: string;
    /**
    description?: The workspace the archive was unpacked into (freshly minted unless you passed one). Every later call targets it by projectId + workdir.
  */
    workdir?: string;
    /**
    description?: True when a fresh workdir was minted for this import.
  */
    mintedWorkdir?: boolean | null;
    /**
    description?: The lambda name whose deploy key was read, when given.
  */
    lambdaName?: string | null;
    /**
    description?: Mongo `lambda` document id, when the import was resolved by lambdaName — pass the artifact from a later publishProject back to this lambda to re-deploy it.
  */
    lambdaId?: string | null;
    /**
    description?: How the lambda was virtualized?: 'archive' (a customUploadFileId .zip, unzipped) or 'code' (the code/packageJson/buildBashScript fields, written as index.js/package.json/build.sh).
  */
    source?: string;
    /**
    description?: Archive source only?: the Mongo `file` id the archive was read from — the lambda's customUploadFileId when fetched by name, or the fileId you passed.
  */
    fileId?: string | null;
    /**
    description?: Archive source only?: S3 object key the archive was read from.
  */
    key?: string | null;
    bucket?: string | null;
    /**
    description?: Fetched archive size in bytes.
  */
    bytes?: number | null;
    /**
    description?: SHA-256 of the fetched archive.
  */
    sha256?: string | null;
    /**
    description?: Number of files imported into the workspace.
  */
    files?: number | null;
    /**
    description?: The file paths imported into the workspace.
  */
    paths?: Array<string>;
    /**
    description?: Archive entries NOT imported — binary files or paths that failed workspace validation. They are not in the workspace.
  */
    skippedFiles?: Array<string>;
}

  
  export interface IStatusQueryType {
    __typename?: "StatusQueryType";
    status?: string | null;
}

  
  export interface IGraphqlFederation {
    __typename?: "GraphqlFederation";
    sdl?: string | null;
}


// tslint:enable
