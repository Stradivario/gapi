import {
  EnumFormatter,
  EnumTypeBuilder,
  GenerateDocumentation,
  GenerateSubTypeInterface,
  IDefaultTypeMap,
  IFromQueryOptions,
  InputFormatter,
  InterfaceAndTypeBuilder,
  InterfaceDeclarationGenerator,
  InterfaceNameWithExtensions,
  NamespaceGenerator,
  QueryNamer,
  TypeJoiner,
  TypePrinter,
  WrapType,
} from '@gql2ts/types';
export declare const DEFAULT_INTERFACE_DECLARATION: InterfaceDeclarationGenerator;
export declare const DEFAULT_INTERFACE_BUILDER: InterfaceAndTypeBuilder;
export declare const DEFAULT_INTERFACE_NAMER: WrapType;
export declare const DEFAULT_TYPE_BUILDER: InterfaceAndTypeBuilder;
export declare const DEFAULT_TYPE_JOINER: TypeJoiner;
export declare const DEFAULT_TYPE_NAMER: WrapType;
export declare const interfaceExtendListToString: (
  extensions: string[]
) => string;
export declare const ADD_INTERFACE_EXTENSIONS: InterfaceNameWithExtensions;
export declare const DEFAULT_NAME_FRAGMENT: WrapType;
export declare const DEFAULT_NAME_QUERY: QueryNamer;
export declare const DEFAULT_FORMAT_INPUT: InputFormatter;
export declare const DEFAULT_TYPE_MAP: IDefaultTypeMap;
export declare const DEFAULT_WRAP_LIST: WrapType;
export declare const DEFAULT_WRAP_PARTIAL: WrapType;
export declare const DEFAULT_TYPE_PRINTER: TypePrinter;
export declare const DEFAULT_GENERATE_SUBTYPE_INTERFACE_NAME: GenerateSubTypeInterface;
export declare const DEFAULT_ENUM_FORMATTER: EnumFormatter;
export declare const DEFAULT_ENUM_TYPE_BUILDER: EnumTypeBuilder;
export declare const DEFAULT_ENUM_NAME_GENERATOR: WrapType;
export declare const DEFAULT_INPUT_NAME_GENERATOR: WrapType;
export declare const DEFAULT_EXPORT_FUNCTION: WrapType;
export declare const ADD_SEMICOLON: WrapType;
export declare const DEFAULT_NAMESPACE_GENERATOR: NamespaceGenerator;
export declare const DEFAULT_DOCUMENTATION_GENERATOR: GenerateDocumentation;
export declare const DEFAULT_OPTIONS: IFromQueryOptions;
export default DEFAULT_OPTIONS;
