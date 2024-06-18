export type GenericEnumType<T, K> = {
  [key in keyof T]: Partial<K>;
};

export type Unboxed<T> = T extends (infer U)[] ? U : T;

export type Validator<T = never, C = never> = {
  validators?: ((args: Unboxed<T>, context: C) => boolean | Promise<boolean>)[];
  enabled: boolean;
  attributes?: GenericEnumType<Unboxed<T>, boolean>;
};

export type Union<
  Roles,
  Resolvers,
  Actions,
  Context = unknown
> = GenericEnumType<
  Roles,
  {
    [resolver in keyof Resolvers]: Partial<
      Record<keyof Actions, Validator<Resolvers[resolver], Context>>
    >;
  }
>;
