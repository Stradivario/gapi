import { homedir } from 'os';

export type Unboxed<T> = T extends (infer U)[] ? U : T;

export const mainDirectory = [homedir(), '.graphql-server'].join('/');
export const tokenDirectory = [mainDirectory, 'token'].join('/');
export const urlDirectory = [mainDirectory, 'url'].join('/');
export const projectDirectory = [mainDirectory, 'project'].join('/');
