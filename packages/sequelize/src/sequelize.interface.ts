/* eslint-disable @typescript-eslint/no-explicit-any */
import { SequelizeOptions } from 'sequelize-typescript';
import { Dialect } from 'sequelize/types';

export class SequelizeConfig implements SequelizeOptions {
  dialect?: Dialect;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  storage?: string;
  logging?: boolean;
  modelPaths?: string[];
  models?: any[];
  database?: string;
  force?: boolean;
  modifyFunctions?: {
    sync?: () => {};
  } = {};
}
