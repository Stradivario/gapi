import { Inject, Service } from '@rxdi/core';
import { MailData } from '@sendgrid/helpers/classes/mail';

import { SendGridHelperService } from './send-grid.helpers';
import { DefaultEmail } from './tokens';

@Service()
export class SendGridService {
  constructor(
    private sendGridHelper: SendGridHelperService,
    @Inject(DefaultEmail) private defaultEmail: string,
  ) {}

  async sendEmail<T extends string>(to: string, type: T, options?: MailData) {
    const template = this.sendGridHelper.getTemplate(type);
    await this.sendGridHelper.send(
      (options?.from as string) || this.defaultEmail,
      to,
      template,
      options,
    );
    return { status: 'ok' };
  }

  sendEmailWithParams<T extends string, P>(
    to: string,
    type: T,
    options?: MailData,
  ) {
    return async (params: P) => {
      const template = this.sendGridHelper.getTemplate(type);
      await this.sendGridHelper.sendWithParams(
        (options?.from as string) || this.defaultEmail,
        to,
        options,
      )(template, params);
      return { status: 'ok' };
    };
  }
  async sendTemplateString({
    from,
    html,
    subject,
    text,
    to,
    options,
  }: {
    subject: string;
    text: string;
    html: string;
    from: string;
    to: string;
    options?: MailData;
  }) {
    return await this.sendGridHelper.raw(
      subject,
      text,
      html,
      from,
      this.addDefaultEmail(to),
      options,
    );
  }

  addDefaultEmail(to: string): string {
    return to + '; ' + this.defaultEmail;
  }
}
