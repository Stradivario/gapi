import { Inject, Service } from '@rxdi/core';

import { Mailer, Templates, TemplatesModel, TemplateTypes } from './tokens';

@Service()
export class SendGridHelperService {
  constructor(
    @Inject(Templates) private templates: Templates,
    @Inject(Mailer) private mailer: Mailer,
  ) {}

  getTemplate(type: TemplateTypes) {
    return this.templates.filter((t) => t.type === type)[0];
  }

  async send(from: string, to: string, template: TemplatesModel) {
    const html = await (template.asyncHtml || template.html);
    return new Promise(async (resolve, reject) =>
      resolve(
        await this.mailer.send(
          {
            subject: template.subject,
            text: template.text,
            html,
            from,
            to,
          },
          null,
          (e) => (e ? reject(e) : null),
        ),
      ),
    );
  }

  async raw(
    subject: string,
    text: string,
    html: string,
    from: string,
    to: string,
  ) {
    return await this.mailer.send({ subject, text, html, from, to });
  }
}
