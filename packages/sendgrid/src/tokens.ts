import { InjectionToken } from '@rxdi/core';
import { MailData } from '@sendgrid/helpers/classes/mail';
import { MailService } from '@sendgrid/mail';

export const Mailer = new InjectionToken('sendgrid-mailer');
export const Templates = new InjectionToken<TemplatesModel[]>(
  'sendgrid-mailer-templates',
);
export const DefaultEmail = new InjectionToken<string>(
  'sendgrid-mailer-default-email',
);

export type Mailer = typeof MailService;
export type Templates = TemplatesModel[];

// export type TemplateTypes = 'subscribe' | 'forgotpassword' | 'profiling';

export class TemplatesModel implements MailData {
  type?: string;
  subject: string;
  text: string;
  html?: string & Promise<string> & (<T>(arg: T) => Promise<string>);
  to: string;
  from: string;
}
