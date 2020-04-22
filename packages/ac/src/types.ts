export type GenericEnumType<T, K> = {
  [key in keyof T]: Partial<K>;
};

export type Union<T, R, P> = GenericEnumType<
  T,
  Record<keyof R, Partial<{ [key in keyof P]: boolean }>>
>;
