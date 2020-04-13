/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GraphQLEnumType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLType,
  IntrospectionQuery
} from 'graphql';
export declare type PossibleIntrospectionInputs =
  | {
      data: IntrospectionQuery;
    }
  | IntrospectionQuery;
export declare type PossibleSchemaInput =
  | GraphQLSchema
  | string
  | PossibleIntrospectionInputs;
export declare function isIntrospectionResult(
  schema: PossibleIntrospectionInputs
): schema is IntrospectionQuery;
export declare const schemaFromInputs: (
  schema: PossibleSchemaInput
) => GraphQLSchema;
export declare function isNonNullable(
  type: GraphQLType
): type is GraphQLNonNull<any>;
export declare function isList(type: GraphQLType): type is GraphQLList<any>;
export declare function isEnum(type: GraphQLType): type is GraphQLEnumType;
