import { Union } from './types';

export class AccessControl<T, P, R, U = string> {
  #roles: U | Union<T, R, P>;
  constructor(roles: U | Union<T, R, P>) {
    this.#roles = roles;
  }
  can(role: keyof Union<T, R, P>, action: keyof P, resource: keyof R) {
    const selectedRole = this.#roles[role as string];
    const hasResource = !!selectedRole && !!selectedRole[resource];
    const hasAction = hasResource && !!selectedRole[resource][action];

    return !!selectedRole && hasResource && hasAction;
  }
}

export * from './types';
