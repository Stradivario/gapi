import { Inject, Service } from '@rxdi/core';

import { SendGridHelperService } from './send-grid.helpers';
import { DefaultEmail, TemplateTypes } from './tokens';

@Service()
export class SendGridService {
  constructor(
    private sendGridHelper: SendGridHelperService,
    @Inject(DefaultEmail) private defaultEmail: string,
  ) {}

  async sendEmail(to: string, type: TemplateTypes, from?: string) {
    const template = this.sendGridHelper.getTemplate(type);
    await this.sendGridHelper.send(from || this.defaultEmail, to, template);
    return { status: 'ok' };
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
