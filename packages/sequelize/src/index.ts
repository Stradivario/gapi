import { Module, ModuleWithServices } from '@rxdi/core';
import { Sequelize } from 'sequelize-typescript';

import { SEQUELIZE } from './sequelize-config.service';
import { SequelizeConfig } from './sequelize.interface';

@Module()
export class SequelizeModule {
  public static forRoot(config: SequelizeConfig): ModuleWithServices {
    return {
      module: SequelizeModule,
      services: [
        {
          provide: SEQUELIZE,
          lazy: true,
          useFactory: async () => {
            const sequelize = new Sequelize(config);
            sequelize.addModels(config.models ? config.models : []);
            await sequelize.sync(config);
            return sequelize;
          }
        }
      ]
    };
  }
}

export * from './sequelize.interface';
export * from './sequelize-config.service';
