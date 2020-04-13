import { IFromQueryOptions, ITypeMap } from '@gql2ts/types';
import { PossibleSchemaInput } from '@gql2ts/util';
export declare type SchemaToInterfaces = (
  schema: PossibleSchemaInput,
  options?: Partial<ISchemaToInterfaceOptions>,
  formatters?: Partial<IFromQueryOptions>
) => string;
export declare const schemaToInterfaces: SchemaToInterfaces;
export declare type GenerateNamespace = (
  namespace: string,
  schema: PossibleSchemaInput,
  options?: Partial<ISchemaToInterfaceOptions>,
  overrides?: Partial<IFromQueryOptions>
) => string;
export declare const generateNamespace: GenerateNamespace;
export interface ISchemaToInterfaceOptions {
  legacy?: boolean;
  ignoredTypes: string[];
  ignoreTypeNameDeclaration?: boolean;
  namespace: string;
  outputFile?: string;
  externalOptions?: string;
  typeMap?: ITypeMap;
  excludeDeprecatedFields?: boolean;
}
export interface IInternalOptions extends Partial<ISchemaToInterfaceOptions> {
  formats: IFromQueryOptions;
}
