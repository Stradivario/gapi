/* eslint-disable @typescript-eslint/no-explicit-any */

import { Container } from '@gapi/core';

import {
  CommandsToken,
  EnumToken,
} from '../../app.tokents';

type GenericEnumType<T, K, A> = {
  [key in keyof T]: (args: A) => K;
};

export type GenericEnum<
  C,
  T = any,
  K = any,
> = GenericEnumType<C, T, K>;

export const getAction = <T = object, K = object>(
  cmd: string | number,
): ((args: K, cwd?: string) => Promise<T>) =>
  Container.get(CommandsToken)[
    Container.get(EnumToken)[cmd]
  ];

export const executeAction = <T = object, K = object>(
  action: string | number,
) => getAction<T, K>(action);
