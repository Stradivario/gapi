import { Module } from '@gapi/core';

import { CoreModule } from './core/core.module';
import { ServerController } from './server.controller';

@Module({
  imports: [CoreModule],
  controllers: [ServerController]
})
export class ServerModule {}
