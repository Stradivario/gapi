import { Union } from './types';

export class AccessControl<T, R, P> {
  #roles: Union<T, R, P>;
  constructor(roles: Union<T, R, P>) {
    this.#roles = roles;
  }

  can(role: keyof T, action: keyof P, resource: keyof R) {
    const selectedRole = this.#roles[role as string];
    const hasResource = !!selectedRole && !!selectedRole[resource];
    const hasAction = hasResource && !!selectedRole[resource][action];
    const isActionActive =
      hasAction && !!selectedRole[resource][action].enabled;

    return !!selectedRole && hasResource && hasAction && isActionActive;
  }

  filter(role: keyof T, action: keyof P, resource: keyof R) {
    const can = this.can(role, action, resource);
    const attributes =
      (this.#roles[role as string][resource][action].attributes as string[]) ||
      [];
    return async (res: unknown) => {
      if (!can) {
        return res;
      }
      let data = await res;
      const attrArray = Object.keys(attributes).filter((a) => !attributes[a]);
      if (Array.isArray(data)) {
        data = data.map((a) => {
          for (const attr of attrArray) {
            if (Array.isArray(a[attr])) {
              a[attr] = [];
            } else {
              delete a[attr];
            }
          }
          return a;
        });
      } else {
        for (const attr of attrArray) {
          delete data[attr];
        }
      }
      return data;
    };
  }
}

export * from './types';
