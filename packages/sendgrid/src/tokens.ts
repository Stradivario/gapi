/* eslint-disable @typescript-eslint/no-explicit-any */
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

export type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export class TemplatesModel implements Without<MailData, 'html'> {
  type?: string;
  subject: string;
  text: string;
  html?: (arg?: any) => Promise<string>;
  to: string;
  from: string;
}
