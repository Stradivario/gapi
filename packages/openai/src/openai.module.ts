import { Module, ModuleWithProviders } from '@gapi/core';
import { ClientOptions, OpenAI as OpenAIApi } from 'openai';

import { OpenAIController } from './openai.controller';
import { OpenAI } from './openai.tokens';

@Module({
  controllers: [OpenAIController],
})
export class OpenAIModue {
  public static forRoot(config: ClientOptions): ModuleWithProviders {
    return {
      module: OpenAIModue,
      providers: [
        {
          provide: OpenAI,
          useFactory: () => new OpenAIApi(config),
        },
      ],
    };
  }
}
