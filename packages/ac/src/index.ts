import { Union } from './types';

export class AccessControl<T, R, P, C = unknown> {
  #roles: Union<T, R, P, C>;
  constructor(roles: Union<T, R, P, C>) {
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

  getRoles(role: keyof T, action: keyof P, resource: keyof R) {
    return (
      this.can(role, action, resource) &&
      this.#roles[role as string][resource][action]
    );
  }

  validate(role: keyof T, action: keyof P, resource: keyof R) {
    return async (args: unknown, context: C) => {
      const can = this.can(role, action, resource);
      if (!can) {
        return false;
      }
      const roles: {
        validators?: ((
          args: unknown,
          context: C,
        ) => boolean | Promise<boolean>)[];
      } = this.getRoles(role, action, resource);
      for (const v of roles.validators || []) {
        if (typeof v === 'function') {
          const c = await v(args, context);
          if (!c) {
            return false;
          }
        }
      }
      return true;
    };
  }

  filter(role: keyof T, action: keyof P, resource: keyof R) {
    const can = this.can(role, action, resource);
    const attributes =
      (this.#roles[role as string][resource][action].attributes as string[]) ||
      [];
    return async <T>(res: T | Promise<T>): Promise<T> => {
      if (!can) {
        return res;
      }
      let data = (await res) as T | T[];
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
      return data as T;
    };
  }
}

export * from './types';
