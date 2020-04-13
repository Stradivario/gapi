import { Container, Service } from '@rxdi/core';

import { ArgsService } from '../core/services/args.service';
import { ExecService } from '../core/services/exec.service';

@Service()
export class NewTask {
  private execService: ExecService = Container.get(ExecService);
  private argsService: ArgsService = Container.get(ArgsService);
  private repoLinks = {
    basic: 'https://github.com/Stradivario/gapi-starter-simple',
    advanced: 'https://github.com/Stradivario/gapi-starter-postgres-sequelize',
    microservices: 'https://github.com/Stradivario/gapi-starter-microservices',
    serverless: 'https://github.com/Stradivario/gapi-starter-serverless',
    serverlessSequelize:
      'https://github.com/Stradivario/gapi-starter-serverless-sequelize',
    rxdiServer: 'https://github.com/rxdi/starter-server-side',
    rxdiClient: 'https://github.com/rxdi/starter-client-side',
    rxdiClientAdvanced: 'https://github.com/rxdi/starter-client-side-advanced',
    rxdiNeoTypescript: 'https://github.com/rxdi/starter-neo4j-typescript',
    rxdiNeoJavascript: 'https://github.com/rxdi/starter-neo4j-javascript',
    rxdiNeoComplex: 'https://github.com/rxdi/starter-neo4j-typescript-complex'
  };

  async run() {
    if (this.argsService.args.toString().includes('--advanced')) {
      await this.exec(this.repoLinks.advanced);
    } else if (this.argsService.args.toString().includes('--microservices')) {
      await this.exec(this.repoLinks.microservices);
    } else if (
      this.argsService.args.toString().includes('--serverless-sequelize')
    ) {
      await this.exec(this.repoLinks.serverlessSequelize);
    } else if (this.argsService.args.toString().includes('--serverless')) {
      await this.exec(this.repoLinks.serverless);
    } else if (this.argsService.args.toString().includes('--rxdi-server')) {
      await this.exec(this.repoLinks.rxdiServer);
    } else if (this.argsService.args.toString().includes('--rxdi-client')) {
      await this.exec(this.repoLinks.rxdiClient);
    } else if (
      this.argsService.args.toString().includes('--rxdi-client-advanced')
    ) {
      await this.exec(this.repoLinks.rxdiClientAdvanced);
    } else if (
      this.argsService.args.toString().includes('--neo4j-typescript')
    ) {
      await this.exec(this.repoLinks.rxdiNeoTypescript);
    } else if (
      this.argsService.args.toString().includes('--neo4j-javascript')
    ) {
      await this.exec(this.repoLinks.rxdiNeoJavascript);
    } else if (this.argsService.args.toString().includes('--neo4j-complex')) {
      await this.exec(this.repoLinks.rxdiNeoComplex);
    } else {
      await this.exec(
        this.repoLinks.basic,
        'echo basic example uses ts-node and @gapi/cli installed internally because of Heroku easy deployment button. To uninstall ts-node and @gapi/cli type "npm uninstall ts-node @gapi/cli"'
      );
    }
  }

  async exec(repoLink: string, args = '') {
    await this.execService.call(
      `git clone ${repoLink} ${process.argv[3]} && cd ./${
        process.argv[3]
      } && npm install ${args ? `&& ${args}` : ''}`
    );
  }
}
