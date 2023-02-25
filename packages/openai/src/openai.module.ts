import { Module, ModuleWithProviders } from '@gapi/core';
import { Configuration, ConfigurationParameters, OpenAIApi } from 'openai';

import { OpenAIController } from './openai.controller';
import { OpenAI } from './openai.tokens';

@Module({
  controllers: [OpenAIController],
})
export class OpenAIModue {
  public static forRoot(config: ConfigurationParameters): ModuleWithProviders {
    return {
      module: OpenAIModue,
      providers: [
        {
          provide: OpenAI,
          useFactory: () => new OpenAIApi(new Configuration(config)),
        },
      ],
    };
  }
}
