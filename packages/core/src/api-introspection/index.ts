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
  findUser: IUserType | null;
  listUsers: Array<IUserType> | null;
  checkTokenValidity: IUserTokenValidityType | null;
  findRecipeById: IDrinkType | null;
  searchRecipe: IDrinkListType | null;
  listRecipes: IDrinkListType | null;
  findPurchase: IPurchasesType | null;
  listPurchases: IPurchasesListType | null;
  listPurchasesByUserId: IPurchasesListType | null;
  findMarketById: IMarketType | null;
  findMarketParticipiants: IMarketParticipiantsListType | null;
  findMarketPurchases: IMarketPurchasesListType | null;
  findParticipiantById: IParticipiantType | null;
  findCredentialById: ICredentialType | null;
}

export interface IStatusQueryType {
  __typename?: 'StatusQueryType';
  status: string | null;
}

export interface IUserType {
  __typename?: 'UserType';
  id: string | null;
  email: string | null;
  name: string | null;
  credential: ICredentialType | null;
  type: string | null;
  settings: IUserSettings | null;
  purchases: IPurchasesType | null;
  marketId: number | null;
  markets: Array<IMarketType> | null;
}

export interface ICredentialType {
  __typename?: 'CredentialType';
  id: number | null;
  email: string | null;
}

export interface IUserSettings {
  __typename?: 'UserSettings';
  sidebar: boolean | null;
  language: string | null;
}

export interface IPurchasesType {
  __typename?: 'PurchasesType';
  id: string | null;
  purchaseData: IPurchaseDataType | null;
  drink: IDrinkType | null;
  drinkId: number | null;
  userId: number | null;
  lat: string | null;
  lng: string | null;
  user: IUserType | null;
  marketId: number | null;
  status: string | null;
  creationDate: string | null;
  deletionDate: string | null;
  updatedOn: string | null;
  dayOfMonth: number | null;
  point: IGeoJSONPoint | null;
}

export interface IPurchaseDataType {
  __typename?: 'PurchaseDataType';
  payment_type: string | null;
}

export interface IDrinkType {
  __typename?: 'DrinkType';
  id: number | null;
  name: string | null;
  description: string | null;
  recipeIngredientId: number | null;
  recipeIngredients: Array<IRecipeIngredientType> | null;
  userId: number | null;
  drinkData: IDrinkDataType | null;
}

export interface IRecipeIngredientType {
  __typename?: 'RecipeIngredientType';
  id: number | null;
  amount: number | null;
  recipeId: number | null;
  recipe: IRecipeType | null;
  ingredientId: number | null;
  ingredient: IIngredientType | null;
  measureId: number | null;
  measure: IMeasureType | null;
}

export interface IRecipeType {
  __typename?: 'RecipeType';
  id: number | null;
  name: string | null;
  description: string | null;
  instructions: string | null;
  people: Array<IUserType> | null;
}

export interface IUserFilterType {
  id?: IStringFilter | null;
  name?: IStringFilter | null;
  credential?: ICredentialObjectFilterType | null;
  type?: IStringFilter | null;
  settings?: IUserSettingsObjectFilterType | null;
  purchases?: IPurchasesObjectFilterType | null;
  markets?: IMarketObjectFilterType | null;
  OR?: Array<IUserFilterType> | null;
  AND?: Array<IUserFilterType> | null;
  NOR?: Array<IUserFilterType> | null;
}

/**
    description: Filter type for String scalar
  */
export interface IStringFilter {
  /**
    description: $eq
  */
  EQ?: string | null;
  /**
    description: $gt
  */
  GT?: string | null;
  /**
    description: $gte
  */
  GTE?: string | null;
  /**
    description: $in
  */
  IN?: Array<string> | null;
  /**
    description: $lt
  */
  LT?: string | null;
  /**
    description: $lte
  */
  LTE?: string | null;
  /**
    description: $ne
  */
  NE?: string | null;
  /**
    description: $nin
  */
  NIN?: Array<string> | null;
  /**
    description: $regex
  */
  REGEX?: string | null;
  /**
    description: $options. Modifiers for the $regex expression. Field is ignored on its own
  */
  OPTIONS?: string | null;
  /**
    description: $not
  */
  NOT?: IStringNotFilter | null;
  /**
    description: DEPRECATED: Switched to the more intuitive operator fields
  */
  opr?: IOprEnum | null;
  /**
    description: DEPRECATED: Switched to the more intuitive operator fields
  */
  value?: string | null;
  /**
    description: DEPRECATED: Switched to the more intuitive operator fields
  */
  values?: Array<string> | null;
  /**
    description: DEPRECATED: use NE
  */
  NEQ?: string | null;
}

/**
    description: Filter type for $not of String scalar
  */
export interface IStringNotFilter {
  /**
    description: $eq
  */
  EQ?: string | null;
  /**
    description: $gt
  */
  GT?: string | null;
  /**
    description: $gte
  */
  GTE?: string | null;
  /**
    description: $in
  */
  IN?: Array<string> | null;
  /**
    description: $lt
  */
  LT?: string | null;
  /**
    description: $lte
  */
  LTE?: string | null;
  /**
    description: $ne
  */
  NE?: string | null;
  /**
    description: $nin
  */
  NIN?: Array<string> | null;
  /**
    description: $regex
  */
  REGEX?: string | null;
  /**
    description: $options. Modifiers for the $regex expression. Field is ignored on its own
  */
  OPTIONS?: string | null;
}

export type IOprEnum =
  | 'EQL'
  | 'GT'
  | 'GTE'
  | 'IN'
  | 'LT'
  | 'LTE'
  | 'NE'
  | 'NIN';

export interface ICredentialObjectFilterType {
  id?: IIntFilter | null;
  email?: IStringFilter | null;
  opr?: IOprExistsEnum | null;
}

/**
    description: Filter type for Int scalar
  */
export interface IIntFilter {
  /**
    description: $eq
  */
  EQ?: number | null;
  /**
    description: $gt
  */
  GT?: number | null;
  /**
    description: $gte
  */
  GTE?: number | null;
  /**
    description: $in
  */
  IN?: Array<number> | null;
  /**
    description: $lt
  */
  LT?: number | null;
  /**
    description: $lte
  */
  LTE?: number | null;
  /**
    description: $ne
  */
  NE?: number | null;
  /**
    description: $nin
  */
  NIN?: Array<number> | null;
  /**
    description: $not
  */
  NOT?: IIntNotFilter | null;
  /**
    description: DEPRECATED: Switched to the more intuitive operator fields
  */
  opr?: IOprEnum | null;
  /**
    description: DEPRECATED: Switched to the more intuitive operator fields
  */
  value?: number | null;
  /**
    description: DEPRECATED: Switched to the more intuitive operator fields
  */
  values?: Array<number> | null;
  /**
    description: DEPRECATED: use NE
  */
  NEQ?: number | null;
}

/**
    description: Filter type for $not of Int scalar
  */
export interface IIntNotFilter {
  /**
    description: $eq
  */
  EQ?: number | null;
  /**
    description: $gt
  */
  GT?: number | null;
  /**
    description: $gte
  */
  GTE?: number | null;
  /**
    description: $in
  */
  IN?: Array<number> | null;
  /**
    description: $lt
  */
  LT?: number | null;
  /**
    description: $lte
  */
  LTE?: number | null;
  /**
    description: $ne
  */
  NE?: number | null;
  /**
    description: $nin
  */
  NIN?: Array<number> | null;
}

export type IOprExistsEnum = 'EXISTS' | 'NOT_EXISTS';

export interface IUserSettingsObjectFilterType {
  sidebar?: IBooleanFilter | null;
  language?: IStringFilter | null;
  opr?: IOprExistsEnum | null;
}

/**
    description: Filter type for Boolean scalar
  */
export interface IBooleanFilter {
  /**
    description: $eq
  */
  EQ?: boolean | null;
  /**
    description: $gt
  */
  GT?: boolean | null;
  /**
    description: $gte
  */
  GTE?: boolean | null;
  /**
    description: $in
  */
  IN?: Array<boolean> | null;
  /**
    description: $lt
  */
  LT?: boolean | null;
  /**
    description: $lte
  */
  LTE?: boolean | null;
  /**
    description: $ne
  */
  NE?: boolean | null;
  /**
    description: $nin
  */
  NIN?: Array<boolean> | null;
  /**
    description: $not
  */
  NOT?: IBooleanNotFilter | null;
  /**
    description: DEPRECATED: Switched to the more intuitive operator fields
  */
  opr?: IOprEnum | null;
  /**
    description: DEPRECATED: Switched to the more intuitive operator fields
  */
  value?: boolean | null;
  /**
    description: DEPRECATED: Switched to the more intuitive operator fields
  */
  values?: Array<boolean> | null;
  /**
    description: DEPRECATED: use NE
  */
  NEQ?: boolean | null;
}

/**
    description: Filter type for $not of Boolean scalar
  */
export interface IBooleanNotFilter {
  /**
    description: $eq
  */
  EQ?: boolean | null;
  /**
    description: $gt
  */
  GT?: boolean | null;
  /**
    description: $gte
  */
  GTE?: boolean | null;
  /**
    description: $in
  */
  IN?: Array<boolean> | null;
  /**
    description: $lt
  */
  LT?: boolean | null;
  /**
    description: $lte
  */
  LTE?: boolean | null;
  /**
    description: $ne
  */
  NE?: boolean | null;
  /**
    description: $nin
  */
  NIN?: Array<boolean> | null;
}

export interface IPurchasesObjectFilterType {
  id?: IStringFilter | null;
  purchaseData?: IPurchaseDataObjectFilterType | null;
  drinkId?: IIntFilter | null;
  userId?: IIntFilter | null;
  lat?: IStringFilter | null;
  lng?: IStringFilter | null;
  marketId?: IIntFilter | null;
  status?: IStringFilter | null;
  creationDate?: IStringFilter | null;
  deletionDate?: IStringFilter | null;
  updatedOn?: IStringFilter | null;
  opr?: IOprExistsEnum | null;
}

export interface IPurchaseDataObjectFilterType {
  opr?: IOprExistsEnum | null;
}

export interface IMarketObjectFilterType {
  id?: IStringFilter | null;
  name?: IStringFilter | null;
  opr?: IOprExistsEnum | null;
}

export interface IUserSortType {
  id?: ISortTypeEnum | null;
  name?: ISortTypeEnum | null;
  credential?: ICredentialSortType | null;
  type?: ISortTypeEnum | null;
  settings?: IUserSettingsSortType | null;
  purchases?: IPurchasesSortType | null;
}

export type ISortTypeEnum = 'ASC' | 'DESC';

export interface ICredentialSortType {
  id?: ISortTypeEnum | null;
  email?: ISortTypeEnum | null;
}

export interface IUserSettingsSortType {
  sidebar?: ISortTypeEnum | null;
  language?: ISortTypeEnum | null;
}

export interface IPurchasesSortType {
  id?: ISortTypeEnum | null;
  purchaseData?: IPurchaseDataSortType | null;
  drinkId?: ISortTypeEnum | null;
  userId?: ISortTypeEnum | null;
  lat?: ISortTypeEnum | null;
  lng?: ISortTypeEnum | null;
  marketId?: ISortTypeEnum | null;
  status?: ISortTypeEnum | null;
  creationDate?: ISortTypeEnum | null;
  deletionDate?: ISortTypeEnum | null;
  updatedOn?: ISortTypeEnum | null;
}

export interface IPurchaseDataSortType {
  /**
    description: IGNORE. Due to limitations of the package, objects with no sortable fields are not ommited. GraphQL input object types must have at least one field
  */
  _FICTIVE_SORT?: ISortTypeEnum | null;
}

export interface IPaginationType {
  limit?: number | null;
  skip?: number | null;
}

export interface IIngredientType {
  __typename?: 'IngredientType';
  id: number | null;
  name: string | null;
}

export interface IMeasureType {
  __typename?: 'MeasureType';
  id: number | null;
  name: string | null;
}

export interface IDrinkDataType {
  __typename?: 'DrinkDataType';
  images: Array<string> | null;
}

/**
    description: Object describing a single geographical point.
  */
export interface IGeoJSONPoint {
  __typename?: 'GeoJSONPoint';
  type: IGeoJSONTypeEnum;
  crs: IGeoJSONCoordinateReferenceSystem;
  bbox: Array<number> | null;
  coordinates: any | null;
}

type GeoJSONInterface = IGeoJSONPoint;

export interface IGeoJSONInterface {
  __typename?: 'GeoJSONInterface';
  type: IGeoJSONTypeEnum;
  crs: IGeoJSONCoordinateReferenceSystem;
  bbox: Array<number> | null;
}

export /**
    description: Enumeration of all GeoJSON object types.
  */
type IGeoJSONTypeEnum =
  | 'Point'
  | 'MultiPoint'
  | 'LineString'
  | 'MultiLineString'
  | 'Polygon'
  | 'MultiPolygon'
  | 'GeometryCollection'
  | 'Feature'
  | 'FeatureCollection';

/**
    description: Coordinate Reference System (CRS) object.
  */
export interface IGeoJSONCoordinateReferenceSystem {
  __typename?: 'GeoJSONCoordinateReferenceSystem';
  type: IGeoJSONCRSTypeEnum;
  properties: GeoJSONCRSProperties;
}

export /**
    description: Enumeration of all GeoJSON CRS object types.
  */
type IGeoJSONCRSTypeEnum = 'name' | 'link';

/**
    description: CRS object properties.
  */
type GeoJSONCRSProperties =
  | IGeoJSONNamedCRSProperties
  | IGeoJSONLinkedCRSProperties;

/**
    description: Properties for name based CRS object.
  */
export interface IGeoJSONNamedCRSProperties {
  __typename?: 'GeoJSONNamedCRSProperties';
  name: string;
}

/**
    description: Properties for link based CRS object.
  */
export interface IGeoJSONLinkedCRSProperties {
  __typename?: 'GeoJSONLinkedCRSProperties';
  href: string;
  type: string | null;
}

type GeoJSONGeometryInterface = IGeoJSONPoint;

export interface IGeoJSONGeometryInterface {
  __typename?: 'GeoJSONGeometryInterface';
  type: IGeoJSONTypeEnum;
  crs: IGeoJSONCoordinateReferenceSystem;
  bbox: Array<number> | null;
  coordinates: any | null;
}

export interface IMarketType {
  __typename?: 'MarketType';
  id: string | null;
  name: string | null;
  purchases: Array<IPurchasesType> | null;
}

export interface IUserTokenValidityType {
  __typename?: 'UserTokenValidityType';
  valid: boolean | null;
}

export interface IDrinkListType {
  __typename?: 'DrinkListType';
  count: number | null;
  rows: Array<IDrinkType> | null;
}

export interface IPurchasesListType {
  __typename?: 'PurchasesListType';
  count: number | null;
  rows: Array<IPurchasesType> | null;
}

export interface IMarketParticipiantsListType {
  __typename?: 'MarketParticipiantsListType';
  count: number | null;
  rows: Array<IParticipiantType> | null;
}

export interface IParticipiantType {
  __typename?: 'ParticipiantType';
  id: number | null;
  userId: number | null;
  user: IUserType | null;
  market: IMarketType | null;
  marketId: number | null;
  status: string | null;
}

export interface IMarketPurchasesListType {
  __typename?: 'MarketPurchasesListType';
  count: number | null;
  rows: Array<IPurchasesType> | null;
}

/**
    description: Mutation type for all requests which will change persistent data
  */
export interface IMutation {
  __typename?: 'Mutation';
  destroyUser: IUserType | null;
  updateUser: IUserType | null;
  addUser: IUserType | null;
  publishSignal: IUserMessage | null;
  register: IUserRegisterType | null;
  login: IUserTokenType | null;
  createPurchase: IPurchasesType | null;
}

export interface IUserPayloadType {
  username: string;
  settings?: IUserPayloadSettingsType | null;
}

export interface IUserPayloadSettingsType {
  sidebar: boolean;
  language: string;
}

export interface IAddUserInputObjectType {
  sidebar?: boolean | null;
  language?: string | null;
}

export interface IUserMessage {
  __typename?: 'UserMessage';
  message: string | null;
}

export interface IUserRegisterType {
  __typename?: 'UserRegisterType';
  user: IUserType | null;
  credential: ICredentialType | null;
}

export interface IUserTokenType {
  __typename?: 'UserTokenType';
  token: string | null;
  user: IUserType | null;
}

export interface IPurchaseInputType {
  purchaseData?: IPurchaseInputDataType | null;
  drinkId?: number | null;
  marketId?: number | null;
  lat?: string | null;
  lng?: string | null;
}

export interface IPurchaseInputDataType {
  status?: string | null;
}

/**
    description: Subscription type for all subscriptions via pub sub
  */
export interface ISubscription {
  __typename?: 'Subscription';
  subscribeToUserMessagesBasic: IUserMessage | null;
  subscribeToUserMessagesWithFilter: IUserMessage | null;
  purchaseSubscription: IPurchasesType | null;
}

// tslint:enable
