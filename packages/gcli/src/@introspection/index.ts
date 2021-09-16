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
    listProjectBoards?: IBoardType | null;
    listProjects?: Array<IProjectType> | null;
    getProject?: IProjectType | null;
    getProjectBoards?: Array<IBoardType> | null;
    getProjectStatistics?: IProjectStatisticsType | null;
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
    getTemperatureHistory?: Array<IIotTemperatureSensorData> | null;
    listDevices?: Array<IIotDeviceType> | null;
    listFlows?: Array<IIotFlowType> | null;
    getFlow?: IIotFlowType | null;
    listChats?: Array<IChat> | null;
    listChatMessages?: Array<IChatMessage> | null;
    getChat?: IChat | null;
    getLambdaEditors?: Array<IUserType> | null;
    listMigrations?: Array<IMigrationType> | null;
    removeMigration?: IMigrationType | null;
    getMigration?: IMigrationType | null;
    migrateStatus?: IProcessGenericType | null;
    listDatabaseBackups?: Array<IAmazonFile> | null;
    findApp?: IAppType | null;
    getRouterUrl?: IFissionType | null;
    getLambdaLogs?: IFissionLogsType | null;
    getLambdaLogsByName?: IFissionLogsType | null;
    listProjectLambdas?: Array<IFissionType> | null;
    getLambda?: IFissionType | null;
    getLambdaByName?: IFissionType | null;
    getLambdaBuilderLogs?: IFissionLogsType | null;
    getLambdaBuilderLogsByName?: IFissionLogsType | null;
    getSecretMap?: IKubectlConfig | null;
    getSecretMapById?: IKubectlConfig | null;
    getConfigMap?: IKubectlConfig | null;
    getConfigMapById?: IKubectlConfig | null;
    listProjectSecrets?: Array<IKubectlConfig> | null;
    listProjectConfigs?: Array<IKubectlConfig> | null;
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
    boardId?: string | null;
    board?: IBoardType | null;
    description?: string | null;
    dueDate?: string | null;
    dueDateComplete?: string | null;
    members?: Array<IUserType> | null;
    sessions?: Array<ISessionType> | null;
    labels?: Array<string> | null;
    comments?: Array<ICardComment> | null;
    files?: Array<IGraphqlFile> | null;
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
    environment?: ISpawnType | null;
    currentUserScope?: Array<string> | null;
    sessions?: Array<ISessionType> | null;
    team?: ITeamType | null;
    members?: Array<IUserType> | null;
    boards?: Array<IBoardType> | null;
    machines?: Array<IMachine> | null;
    repositories?: Array<IRepositoriesType> | null;
}

  
  export interface ISpawnType {
    __typename?: "SpawnType";
    vsCodePort?: string | null;
    clientPort?: string | null;
    apiPort?: string | null;
    majesticPort?: string | null;
    containerName?: string | null;
    clientWsPort?: string | null;
    vsCodeLink?: string | null;
    serverAppLink?: string | null;
    clientAppLink?: string | null;
    majesticLink?: string | null;
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
    project?: IProjectType | null;
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
}

  
  export interface IFileAmazonMetadata {
    __typename?: "FileAmazonMetadata";
    Key?: string | null;
    Bucket?: string | null;
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
}

  
  export interface IIotTemperatureSensorData {
    __typename?: "IotTemperatureSensorData";
    createdAt?: string | null;
    raw?: string | null;
    rh?: number | null;
    temp?: number | null;
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
    participants?: Array<IUserType> | null;
    messages?: Array<IChatMessage> | null;
}

  
  export interface IChatMessage {
    __typename?: "ChatMessage";
    id?: string | null;
    content?: string | null;
    from?: string | null;
    user?: IUserType | null;
    chatId?: string | null;
    chat?: IChat | null;
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

  
  export interface IFissionType {
    __typename?: "FissionType";
    id?: string | null;
    projectId?: string | null;
    name?: string | null;
    url?: string | null;
    route?: string | null;
    params?: Array<string> | null;
    code?: string | null;
    /**
    description?: This is a name of the kubernetes secret
  */
    secret?: IKubectlConfig | null;
    config?: string | null;
    env?: string | null;
    method?: string | null;
    packageJson?: string | null;
    buildBashScript?: string | null;
    createdBy?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

  
  export interface IKubectlConfig {
    __typename?: "KubectlConfig";
    id?: string | null;
    projectId?: string | null;
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
}

  
  export interface IFissionLogsType {
    __typename?: "FissionLogsType";
    data?: string | null;
}

  
  export interface IGenericKubectName {
    name?: string;
    projectId?: string;
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
    transferProject?: IProjectType | null;
    createProject?: IProjectType | null;
    assignProject?: Array<IProjectType> | null;
    assignMachineToProject?: IProjectType | null;
    removeMachineFromProject?: IProjectType | null;
    updateProjectRepositories?: IProjectType | null;
    addProjectMember?: IUserType | null;
    removeProjectMember?: IUserType | null;
    deleteProject?: IProjectType | null;
    createUser?: IUserType | null;
    generateCustomToken?: IUserCustomTokenType | null;
    createFirebaseUser?: IUserType | null;
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
    createChat?: IChat | null;
    addChatMember?: IChat | null;
    removeChatMember?: IChat | null;
    sendChatMessage?: IChatMessage | null;
    migrateUp?: IProcessGenericType | null;
    migrateDown?: IProcessGenericType | null;
    backupDatabase?: IGraphqlFileType | null;
    restoreDatabase?: IGraphqlFileType | null;
    createLambda?: IFissionType | null;
    updateLambda?: IFissionType | null;
    deleteLambda?: IFissionType | null;
    openLambda?: IFissionType | null;
    closeLambda?: IFissionType | null;
    createEnvironment?: IFissionType | null;
    deleteEnvironment?: IFissionType | null;
    createSecretMap?: IKubectlConfig | null;
    createConfigMap?: IKubectlConfig | null;
    updateConfigMap?: IKubectlConfig | null;
    updateSecretMap?: IKubectlConfig | null;
    updateSecretMapById?: IKubectlConfig | null;
    updateConfigMapById?: IKubectlConfig | null;
    deleteSecretMap?: IKubectlConfig | null;
    deleteConfigMap?: IKubectlConfig | null;
    createNamespace?: IKubectlNamespace | null;
    deleteNamespace?: IKubectlNamespace | null;
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
    name?: string;
    columns?: Array<string>;
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
}

  
  export interface IUpdateDeviceInputPayload {
    debug?: boolean;
}

  
  export interface IIotTemperatureSensorType {
    __typename?: "IotTemperatureSensorType";
    id?: string | null;
    serial?: string | null;
    data?: Array<IIotTemperatureSensorData> | null;
}

  
  export interface IIotFlowPayloadType {
    code: string;
    args?: any | null;
    device: string;
    enabled?: boolean | null;
}

  
  export interface IChatPayload {
    name?: string | null;
    participants: Array<string>;
}

  
  export interface IChatMessagePayload {
    chatId?: string | null;
    content?: string | null;
}

  
  export interface IGraphqlFileType {
    __typename?: "GraphqlFileType";
    id?: string | null;
    url?: string | null;
    metadata?: IFileMetadata | null;
    amazonMetadata?: IFileAmazonMetadata | null;
}

  
  export interface ICreateOrUpdateLambdaInput {
    /**
    description: Lambda identifier
  */
    name: string;
    /**
    description: The endpoint resource
  */
    route: string;
    /**
    description: Every project can have lambdas but we need to register them as part of the project
  */
    projectId: string;
    /**
    description: The actual lambda codebase
  */
    code: string;
    /**
    description: This is a name of the kubernetes secret
  */
    secret?: string | null;
    /**
    description: This is a name of the kubernetes config
  */
    config?: string | null;
    /**
    description: When we create lambdas we define parameters here as a array ['id', 'name'] 
and we can execute /my-lambda/{id}/{name}
  */
    params?: Array<string> | null;
    /**
    description: The environment in which this lambda will execute defaults to nodejs
  */
    env?: ILambdaEnvironmentsEnum | null;
    /**
    description: What type of endpoint we are creating GET, POST, etc. defaults to GET
  */
    method?: IHttpMethodsEnum | null;
    packageJson?: string | null;
    buildBashScript?: string | null;
    customUploadFileId?: string | null;
}

export   
  type ILambdaEnvironmentsEnum = 'NODEJS';

export   
  type IHttpMethodsEnum = 'GET' | 'POST' | 'UPDATE' | 'PUT';

  
  export interface IDeleteLambdaInput {
    name?: string;
    projectId?: string;
}

  
  export interface IGenericKubectConfig {
    name?: string;
    projectId?: string;
    pairs?: any;
}

  
  export interface IKubectlNamespace {
    __typename?: "KubectlNamespace";
    projectId?: string | null;
}

  
  export interface IGraphqlFederation {
    __typename?: "GraphqlFederation";
    sdl?: string | null;
}

  
  export interface IStatusQueryType {
    __typename?: "StatusQueryType";
    status?: string | null;
}


// tslint:enable
