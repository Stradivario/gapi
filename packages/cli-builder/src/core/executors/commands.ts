/* eslint-disable @typescript-eslint/no-explicit-any */

import { Container } from '@gapi/core';

import {
  CommandsToken,
  EnumToken
} from '../../app.tokents';

type GenericEnumType<T, K, A> = {
  [key in keyof T]: (args: A) => K;
};

export type GenericEnum<
  C,
  T = Promise<number>,
  K = string[]
> = GenericEnumType<C, T, K>;

export const getAction = <T = {}, K = {}>(
  cmd: string | number
): ((args: K, cwd?: string) => Promise<T>) =>
  Container.get(CommandsToken)[
    Container.get(EnumToken)[cmd]
  ];

export const executeAction = <T = {}, K = {}>(
  action: string | number
) => getAction<T, K>(action);
