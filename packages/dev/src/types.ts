import { homedir } from 'os';

export type Unboxed<T> = T extends (infer U)[] ? U : T;

export const mainDirectory = [homedir(), '.graphql-server'].join('/');
export const tokenDirectory = [mainDirectory, 'token'].join('/');
export const refreshTokenDirectory = [mainDirectory, 'refresh'].join('/');

export const urlDirectory = [mainDirectory, 'url'].join('/');
export const keyDirectory = [mainDirectory, 'key'].join('/');

export const projectDirectory = [mainDirectory, 'project'].join('/');
export const generationTimeDirectory = [mainDirectory, 'generation-time'].join(
  '/',
);

export const uploadUrlDirectory = [mainDirectory, 'upload-url'].join('/');
