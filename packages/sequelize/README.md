# @Gapi/Sequelize

<!-- ![Build Status](http://gitlab.youvolio.com/gapi/gapi/badges/branch/build.svg) -->

#### @Gapi Sequelize module @StrongTyped

##### For questions/issues you can write ticket [here](http://gitlab.youvolio.com/gapi/gapi-sequelize/issues)
##### This module is intended to be used with [GAPI](https://github.com/Stradivario/gapi)

## Installation and basic examples:
##### To install this Gapi module, run:

```bash
$ npm install @gapi/sequelize --save
```

## Consuming gapi-sequelize

##### Import inside AppModule or CoreModule
```typescript

import { Module } from '@rxdi/core';
import { SequelizeModule } from '@gapi/sequelize';

@Module({
    imports: [
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.DB_HOST || '',
            port: process.env.DB_PORT || 5432,
            username: process.env.DB_USERNAME || '',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'your-database',
            storage: ':memory:',
            logging: false,
            modelPaths: [process.cwd() + '/src/models'],
            force: false
        })
    ]
})
export class CoreModule { }
```

##### Create folder root/src/models and put this testing User Typescript-Sequelize Model with Uppercase name example: "User.ts"
```typescript

import {
    Table,
    Column,
    Model,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    PrimaryKey,
    AutoIncrement,
    HasMany,
    DataType,
    BelongsToMany
} from 'sequelize-typescript';

export interface UserSettings {
    sidebar: boolean;
}

@Table
export class User extends Model<User> {

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column({
        type: DataType.ENUM({ values: ['ADMIN', 'USER'] })
    })
    type: 'ADMIN' | 'USER';

    @Column({
        type: DataType.JSONB,
        allowNull: true
    })
    settings: UserSettings;


    @CreatedAt
    creationDate: Date;

    @UpdatedAt
    updatedOn: Date;

    @DeletedAt
    deletionDate: Date;

}

```

##### Final use this class inside your services the following way

```typescript
import { Service } from "@rxdi/core";
import { UserType } from "../types/user.type";
import { User } from '../../../models/User';

@Service()
export class AnotherService {
    trimFirstLetter(username: string): string {
        return username.charAt(1);
    }
}

@Service()
export class UserService {
    constructor(
        private anotherService: AnotherService
    ) { }

    async findUser(id: number): Promise<User> {
        return await User.findOne({ where: { id: id } });
    }

    async addUser(user: User): Promise<User> {
        return await User.create(user);
    }

    async deleteUser(id: number) {
        return await User.destroy({ where: { id: id } });
    }

    async updateUser(user: User) {
        return await User.update(user, {
            where: {
                id: user.id
            }
        })
    }

}

```

#### Advanced getting sequelize instance to manage your sequelize connection

```typescript 
import { Service } from '@rxdi/core';
import { SequelizeService } from '@gapi/sequelize';

@Service()
export class SequelizePrivateService extends SequelizeService implements SequelizeService {
    sequelize: Sequelize;
    constructor() {
        super({
            dialect: 'postgres',
            host: process.env.DB_HOST || '',
            port: process.env.DB_PORT || '5432',
            username: process.env.DB_USERNAME || '',
            password: process.env.DB_PASSWORD || '',
            name: process.env.DB_NAME || 'your-database',
            storage: ':memory:',
            logging: false,
            modelPaths: [process.cwd() + '/src/models'],
            force: false
        })
    }
}

```

#### Next import SequelizePrivateService inside Core or AppModule

```typescript
import { Module } from '@rxdi/core';
import { SequelizeModule } from '@gapi/sequelize';
import { SequelizePrivateService } from './services/sequelize/sequelize.service.ts';

@Module({
    services: [SequelizePrivateService]
})
export class CoreModule { }

```


TODO: Better documentation...

Enjoy ! :)
