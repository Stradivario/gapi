export type GenericEnumType<T, K> = {
  [key in keyof T]: Partial<K>;
};

type Unboxed<T> = T extends (infer U)[] ? U : T;

export type Union<Roles, Resources, Actions> = GenericEnumType<
  Roles,
  {
    [resource in keyof Resources]: Partial<
      Record<
        keyof Actions,
        {
          enabled: boolean;
          attributes?:
            | GenericEnumType<Resources[resource], boolean>
            | GenericEnumType<Unboxed<Resources[resource]>, boolean>;
        }
      >
    >;
  }
>;
