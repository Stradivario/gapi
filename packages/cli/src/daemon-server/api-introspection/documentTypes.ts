function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}
export const DocumentTypes = strEnum([
  'findUser.query.graphql',
  'publishSignal.mutation.graphql',
  'subscribeToUserMessagesBasic.subscription.graphql',
  'getLinkList.query.graphql',
]);
export type DocumentTypes = keyof typeof DocumentTypes;
