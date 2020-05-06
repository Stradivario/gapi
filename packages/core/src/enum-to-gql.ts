import {
  EnumTypeDefinitionNode,
  EnumTypeExtensionNode,
  GraphQLEnumType,
} from 'graphql';
import Maybe from 'graphql/tsutils/Maybe';

interface GraphqlEnumTypeConfig<T = {}> {
  name: string;
  description?: Maybe<string>;
  values: T;
  extensions?: Maybe<Readonly<Record<string, never>>>;
  astNode?: Maybe<EnumTypeDefinitionNode>;
  extensionASTNodes?: Maybe<ReadonlyArray<EnumTypeExtensionNode>>;
}

export const enumToGraphqlEnum = <T>(Enum: T) =>
  Object.keys(Enum).reduce((acc, key, index) => {
    acc[isNaN(Number(Enum[key])) ? Enum[key] : key] = { value: index };
    return acc;
  }, {} as T);

export class GraphqlEnumType<T> extends GraphQLEnumType {
  constructor(config: GraphqlEnumTypeConfig<T>) {
    config.values = enumToGraphqlEnum(config.values);
    super(config as never);
  }
}
