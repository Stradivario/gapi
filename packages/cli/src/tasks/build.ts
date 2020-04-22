import { Container, Service } from '@rxdi/core';
import { exists, readFile, writeFile } from 'fs';
import { promisify } from 'util';

import { includes, nextOrDefault } from '../core/helpers';
import { ConfigService } from '../core/services/config.service';
import { ExecService } from '../core/services/exec.service';
import { StartTask } from './start';

@Service()
export class BuildTask {
  private startTask = Container.get(StartTask);
  private configService: ConfigService = Container.get(ConfigService);
  private execService: ExecService = Container.get(ExecService);

  async run() {
    const cwd = process.cwd();
    const customPath = process.argv[4]
      ? process.argv[4].split('--path=')[1]
      : null;
    const customPathExists = await promisify(exists)(`${cwd}/${customPath}`);
    const filePath = customPathExists
      ? `${cwd}/${customPath}`
      : `${cwd}/src/main.ts`;

    const globPaths = nextOrDefault('--glob', '')
      .split(',')
      .filter((i: string) => !!i)
      .map((f) => `.${f}`);

    if (includes('--ncc-only')) {
      return this.compileToSingleJS(filePath);
    }

    if (includes('--pkg-only')) {
      return this.compileToSingleJS(filePath);
    }

    if (includes('--single-executable')) {
      if (!(await this.isTsConfigPresent())) {
        await this.writeTsConfig();
      }
      await this.compileToSingleJS(filePath);
      await this.compilePKG();
      return;
    }

    await this.startTask.prepareBundler(
      globPaths.length ? globPaths : filePath,
      {
        original: this.configService.config.config.app.local,
        schema: this.configService.config.config.schema,
      }
    );
  }

  private compileToSingleJS(path: string) {
    return this.execService.call(`npx ncc build ${path}`);
  }

  private async compilePKG() {
    let packageName = nextOrDefault('--pkg-name', 'api');
    if (await promisify(exists)('./package.json')) {
      packageName =
        JSON.parse(
          await promisify(readFile)('./package.json', { encoding: 'utf-8' })
        ).name || packageName;
    }
    await promisify(writeFile)(
      './dist/package.json',
      JSON.stringify({
        name: packageName,
        bin: './index.js',
        pkg: {
          assets: [
            './protobuf/**/*',
            './protos/**/*',
            './protos.json',
            './operations.json',
            ...nextOrDefault('--assets', '')
              .split(',')
              .filter((v: string) => v),
          ],
        },
      }),
      { encoding: 'utf-8' }
    );
    await this.execService.call('npx pkg .', { cwd: 'dist' });
  }
  isTsConfigPresent() {
    return promisify(exists)('./tsconfig.json');
  }
  async writeTsConfig() {
    await promisify(writeFile)(
      './tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          module: 'commonjs',
          target: 'es6',
          declaration: true,
          moduleResolution: 'node',
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          removeComments: true,
          allowSyntheticDefaultImports: true,
          preserveConstEnums: true,
          sourceMap: true,
          strictNullChecks: false,
          forceConsistentCasingInFileNames: true,
          noFallthroughCasesInSwitch: true,
          noImplicitAny: false,
          noImplicitReturns: true,
          noImplicitThis: false,
          noUnusedLocals: true,
          noUnusedParameters: false,
          outDir: 'dist',
          lib: [
            'es2017',
            'es2016',
            'es2015',
            'es6',
            'dom',
            'esnext.asynciterable',
          ],
          typeRoots: ['node_modules/@types'],
        },
        include: ['./src/**/*'],
        exclude: ['./node_modules', './src/**/*.spec.ts'],
      }),
      { encoding: 'utf-8' }
    );
  }
}
