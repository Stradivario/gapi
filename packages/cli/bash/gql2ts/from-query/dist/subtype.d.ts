import { GenerateSubTypeInterface } from '@gql2ts/types';
import { FieldNode } from 'graphql';
export interface ISubtypeMetadata {
  name: string;
  dupe: boolean;
}
export declare type SubtypeNamerAndDedupe = (
  selection: FieldNode,
  declaration: string,
  generateSubTypeInterfaceName: GenerateSubTypeInterface
) => ISubtypeMetadata | null;
export declare const GenerateSubtypeCache: () => SubtypeNamerAndDedupe;
