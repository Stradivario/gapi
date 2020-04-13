import { Container, Service } from '@rxdi/core';
import { exists } from 'fs';
import { promisify } from 'util';

import { nextOrDefault } from '../core/helpers';
import { ConfigService } from '../core/services/config.service';
import { StartTask } from './start';

@Service()
export class BuildTask {
  private startTask = Container.get(StartTask);
  private configService: ConfigService = Container.get(ConfigService);

  async run() {
    const cwd = process.cwd();
    const customPath = process.argv[4]
      ? process.argv[4].split('--path=')[1]
      : null;
    const customPathExists = await promisify(exists)(`${cwd}/${customPath}`);
    const globPaths = nextOrDefault('--glob', '')
      .split(',')
      .filter((i: string) => !!i)
      .map(f => `.${f}`);
    if (globPaths.length) {
      return await this.startTask.prepareBundler(globPaths, {
        original: this.configService.config.config.app.local,
        schema: this.configService.config.config.schema
      });
    }
    await this.startTask.prepareBundler(
      `${
        customPathExists
          ? `${cwd}/${customPathExists ? customPath : 'index.ts'}`
          : `${cwd}/src/main.ts`
      }`,
      {
        original: this.configService.config.config.app.local,
        schema: this.configService.config.config.schema
      }
    );
  }
}
