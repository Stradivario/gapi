export type GenericEnumType<T, K> = {
  [key in keyof T]: Partial<K>;
};

type Unboxed<T> = T extends (infer U)[] ? U : T;

export type Union<Roles, Resolvers, Actions> = GenericEnumType<
  Roles,
  {
    [resolver in keyof Resolvers]: Partial<
      Record<
        keyof Actions,
        {
          enabled: boolean;
          attributes?:
            | GenericEnumType<Resolvers[resolver], boolean>
            | GenericEnumType<Unboxed<Resolvers[resolver]>, boolean>;
        }
      >
    >;
  }
>;
