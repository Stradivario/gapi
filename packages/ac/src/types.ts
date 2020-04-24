export type GenericEnumType<T, K> = {
  [key in keyof T]: Partial<K>;
};

export type Unboxed<T> = T extends (infer U)[] ? U : T;

export type Union<
  Roles,
  Resolvers,
  Actions,
  Context = unknown
> = GenericEnumType<
  Roles,
  {
    [resolver in keyof Resolvers]: Partial<
      Record<
        keyof Actions,
        {
          validators?: ((
            args: Unboxed<Resolvers[resolver]>,
            context: Context,
          ) => boolean | Promise<boolean>)[];
          enabled: boolean;
          attributes?: GenericEnumType<Unboxed<Resolvers[resolver]>, boolean>;
        }
      >
    >;
  }
>;
