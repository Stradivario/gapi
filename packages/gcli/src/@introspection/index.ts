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
    description?: Search the knowledge graph using a Cypher query. Use this to find information about concept key-values, code, or previous conversations.
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
  Use 'name' for semantic search and 'id' for exact lookup.
  
  */
    search_graph?: any | null;
    listAvailableModels?: Array<string> | null;
    listChats?: Array<IChat> | null;
    listChatsPerProject?: Array<IChat> | null;
    listChatMessages?: Array<IChatMessage> | null;
    getChat?: IChat | null;
    getChatByProjectId?: IChat | null;
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
    getRouterUrl?: IFissionType | null;
    listProjectLambdas?: Array<IFissionType> | null;
    listMyLambdas?: Array<IFissionType> | null;
    getLambda?: IFissionType | null;
    getLambdaByName?: IFissionType | null;
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
    getFormByName?: IFormDefinition | null;
    getInvoice?: IInvoice | null;
    listInvoices?: Array<IInvoice> | null;
    listProjectInvoices?: Array<IInvoice> | null;
    podCostBreakdown?: Array<IPodCostBreakdown> | null;
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
  type UnionMessagesType = IProjectNotifications | IMachineNotifications;



  
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

  
  export interface IChat {
    __typename?: "Chat";
    id?: string | null;
    name?: string | null;
    projectId?: string | null;
    participants?: Array<IUserType> | null;
    messages?: Array<IChatMessage> | null;
    attachments?: Array<IGraphqlFile> | null;
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
    usageMetadata?: IUsageMetadataOutput | null;
    attachments?: Array<IGraphqlFile> | null;
}

  
  export interface IUsageMetadataOutput {
    __typename?: "UsageMetadataOutput";
    promptTokenCount?: number | null;
    candidatesTokenCount?: number | null;
    totalTokenCount?: number | null;
    cachedContentTokenCount?: number | null;
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
    maxCpu?: number | null;
    maxMemory?: number | null;
    minCpu?: number | null;
    minMemory?: number | null;
    region?: IEnvironmentRegionEnum | null;
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

  
  export interface IFissionLogsType {
    __typename?: "FissionLogsType";
    data?: string | null;
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
              'Access-Control-Allow-Origin'?: 'https?://graphql-server.com',
            },
          };
        };
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
    description?: This is a name of the kubernetes config
  */
    config?: string | null;
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
    disabledWhen?: IFieldDependency | null;
    layout?: string | null;
}

export   
  type IFormInputTypeEnum = 'text' | 'number' | 'password' | 'email' | 'select' | 'array' | 'textarea' | 'json' | 'bash' | 'code' | 'dropdown' | 'object' | 'checkbox' | 'radio';

  
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
    issuedAt?: string | null;
    paidAt?: string | null;
    pdfUrl?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
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
    createUser?: IUserType | null;
    generateCustomToken?: IUserCustomTokenType | null;
    createFirebaseUser?: IUserType | null;
    updateProfile?: IUserType | null;
    setOnlineStatus?: IUserType | null;
    createTeam?: ITeamType | null;
    deleteTeam?: ITeamType | null;
    generateCodeSession?: ISessionType | null;
    deleteSession?: ISessionType | null;
    revokeSession?: ISessionType | null;
    startSession?: ISessionType | null;
    stopSession?: ISessionType | null;
    generateCLIToken?: ICLITokenType | null;
    revokeCLIToken?: ICLITokenType | null;
    publishSignal?: IGenericReturn | null;
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
    description?: Create a relationship between two nodes in the knowledge graph.
          Use this to link concepts, e.g. (Company)-[?:OWNS]->(Website).
          Nodes are identified by their 'id' OR 'name' property.
          
  */
    create_relationship?: any | null;
    createChatAssistant?: IChat | null;
    sendChatAssistantMessage?: IChatMessage | null;
    createCompletionGemini?: ICreateCompletionGeminiType | null;
    createCompletionLambdasGemini?: ICreateCompletionGeminiType | null;
    setAiOptimizationConfig?: IAiOptimizationConfigType | null;
    createChat?: IChat | null;
    addChatMember?: IChat | null;
    removeChatMember?: IChat | null;
    deleteChat?: IChat | null;
    sendChatMessage?: IChatMessage | null;
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
    deleteNamespace?: IKubectlNamespace | null;
    applyNetworkPolicy?: IKubectlNamespace | null;
    allowNamespaceAccess?: IKubectlNamespace | null;
    revokeNamespaceAccess?: IKubectlNamespace | null;
    deleteNetworkPolicy?: IKubectlNamespace | null;
    generateInvoice?: IInvoice | null;
    updateInvoiceStatus?: IInvoice | null;
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

  
  export interface IGenericReturn {
    __typename?: "GenericReturn";
    status?: string | null;
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
    description: .
        Basic code example on how basic lambda should look a like in javascript/nodejs

---BEGIN BASIC EXAMPLE---
export default async function (context) {
  return {
    status: 200,
    body: 'Hello, world!',
    headers: {
      'Access-Control-Allow-Origin': 'https://graphql-server.com',
    },
  };
};
---END BASIC EXAMPLE---

The "context" argument is following this export interface below called "LambdaContext"

export interface LambdaContext {
  request: {
    path: string;
    query: string;
    method: string;
    body: unknown;
    headers: Headers
  };
  response: Response;
  getSecret<T = Record<string, string>>(secret: string): Promise<T>;
  getConfig(secret: string): Promise<Record<string, string>>;
  getLambdaInfo(): {
    name: string;
    namespace: string;
    resourceVersion: string;
    uid: string;
  };
  getQueryParams(): Record<string, string>;
  getBodyParams(): Record<string, string>;
  getRouteParams(): Record<string, string>;
}


---BEGIN GRAPHQL EXAMPLE---
import {
  Bootstrap,
  Container,
  Controller,
  CoreModule,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  HAPI_SERVER,
  Module,
  Query,
  Type,
} from '@gapi/core';
import { lastValueFrom, tap } from 'rxjs';
import { format } from 'url';

export export interface Context {
  request: {
    url: string;
    query: string;
    method: string;
    body: unknown;
    headers: Headers;
  };
  response: Response;
  getSecret<T = Record<string, string>>(secret: string): Promise<T>;
  getConfig(secret: string): Promise<Record<string, string>>;
  getLambdaInfo(): {
    name: string;
    namespace: string;
    resourceVersion: string;
    uid: string;
  };
  getQueryParams(): Record<string, string>;
  getBodyParams(): Record<string, string>;
  getRouteParams(): Record<string, string>;
}

export const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: {
      type: GraphQLInt,
    },
  }),
});

@Controller()
export class UserQueriesController {
  @Type(UserType)
  @Query({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  })
  findUser(root, { id }, context) {
    return { id: id };
  }
}

@Module({
  imports: [
    CoreModule.forRoot({
      server: {
        hapi: {
          port: 9000,
          routes: {
            cors: {
              origin: ['*'],
              additionalHeaders: [
                'Host',
                'User-Agent',
                'Accept',
                'Accept-Language',
                'Accept-Encoding',
                'Access-Control-Request-Method',
                'Access-Control-Allow-Origin',
                'Access-Control-Request-Headers',
                'Origin',
                'Connection',
                'Pragma',
                'cardId',
                'Cache-Control',
              ],
            },
          },
        },
      },
      graphql: {
        path: '/graphql',
        initQuery: true,
        openBrowser: false,
        graphqlOptions: {
          tracing: false,
          schema: null,
        },
      },
    }),
  ],
  controllers: [UserQueriesController],
})
export class AppModule {}

const Main = lastValueFrom(
  Bootstrap(AppModule).pipe(
    tap(() => {
      console.log('[Bootstrap]: Started');
    }),
  ),
);

export default async function handler(context: Context) {
  const request = context.request;
  const headers = {
    'Content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
  };
  await Main;

  const url = format({
    pathname: '/graphql',
    query: request.query,
  });
  const options = {
    method: request.method,
    url,
    payload: request.body,
    headers: request.headers,
    validate: false,
  };
  let res = {
    statusCode: 502,
    result: null,
  };
  console.log('Request Options: ', options);
  try {
    res = await Container.get(HAPI_SERVER).inject(options);
  } catch (e) {
    console.error('ERROR', JSON.stringify(e));
  }
  return {
    status: res.statusCode,
    body: res.result,
    headers,
  };
}
---END GRAPHQL EXAMPLE---
IMPORTANT: Always install "@gapi/core": "^1.8.184" inside package.json when graphql example is asked tell the user what you are going to do!!
      
  */
    code?: string | null;
    /**
    description: List of kubernetes secret names
  */
    secrets?: Array<string> | null;
    /**
    description: This is a name of the kubernetes config
  */
    config?: string | null;
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

  
  export interface IStatusQueryType {
    __typename?: "StatusQueryType";
    status?: string | null;
}

  
  export interface IGraphqlFederation {
    __typename?: "GraphqlFederation";
    sdl?: string | null;
}


// tslint:enable
