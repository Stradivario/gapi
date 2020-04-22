/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GraphQLArgument,
  GraphQLEnumValue,
  GraphQLField,
  GraphQLInputField,
} from 'graphql';
export interface IJSDocTag {
  tag: string;
  value: string;
}
export interface IFieldDocumentation {
  description?: string;
  tags: IJSDocTag[];
}
export declare type BuildDocumentation = (
  field:
    | GraphQLField<any, any>
    | GraphQLInputField
    | GraphQLEnumValue
    | GraphQLArgument
) => IFieldDocumentation;
export declare const getDocTags: null;
export declare const buildDocumentation: BuildDocumentation;
