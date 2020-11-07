import { Inject, Service } from '@rxdi/core';

import { SendGridHelperService } from './send-grid.helpers';
import { DefaultEmail } from './tokens';

@Service()
export class SendGridService {
  constructor(
    private sendGridHelper: SendGridHelperService,
    @Inject(DefaultEmail) private defaultEmail: string,
  ) {}

  async sendEmail<T extends string>(to: string, type: T, from?: string) {
    const template = this.sendGridHelper.getTemplate(type);
    await this.sendGridHelper.send(from || this.defaultEmail, to, template);
    return { status: 'ok' };
  }

  async sendEmailWithParams<T extends string, P>(
    to: string,
    type: T,
    from?: string,
  ) {
    return async (params: P) => {
      const template = this.sendGridHelper.getTemplate(type);
      await this.sendGridHelper.sendWithParams(from || this.defaultEmail, to)(
        template,
        params,
      );
      return { status: 'ok' };
    };
  }
  async sendTemplateString({
    from,
    html,
    subject,
    text,
    to,
  }: {
    subject: string;
    text: string;
    html: string;
    from: string;
    to: string;
  }) {
    return await this.sendGridHelper.raw(
      subject,
      text,
      html,
      from,
      this.addDefaultEmail(to),
    );
  }

  addDefaultEmail(to: string): string {
    return to + '; ' + this.defaultEmail;
  }
}
