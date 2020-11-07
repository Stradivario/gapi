import { Module, ModuleWithProviders } from '@gapi/core';
import * as sgMail from '@sendgrid/mail';

import { DefaultEmail, Mailer, Templates, TemplatesModel } from './tokens';

@Module()
export class SendgridModule {
  public static forRoot(
    options: {
      apiKey?: string;
      templates?: TemplatesModel[];
      defaultEmail?: string;
    } = {
      apiKey: '',
      templates: [],
      defaultEmail: 'kristiqn.tachev@gmail.com',
    },
  ): ModuleWithProviders {
    return {
      module: SendgridModule,
      providers: [
        {
          provide: Mailer,
          useFactory: () => {
            const mailer = sgMail['default'] || sgMail;
            mailer.setApiKey(options.apiKey);
            return mailer;
          },
        },
        {
          provide: Templates,
          useValue: options.templates,
        },
        {
          provide: DefaultEmail,
          useValue: options.defaultEmail,
        },
      ],
    };
  }
}
