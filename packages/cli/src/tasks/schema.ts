import { Container, Service } from '@rxdi/core';
import { exists, readFile, unlink, writeFile } from 'fs';
import { from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { promisify } from 'util';

import { ArgsService } from '../core/services/args.service';
import { ConfigService } from '../core/services/config.service';
import { ExecService } from '../core/services/exec.service';
import { GAPI_DAEMON_CACHE_FOLDER } from '../daemon-server/daemon.config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { mkdirp } = require('@rxdi/core/dist/services/file/dist');
import { LZWService } from '@rxdi/compressor';
import fetch from 'node-fetch';

@Service()
export class SchemaTask {
  private folder: string;
  private endpoint: string;
  private headers: string;
  private node_modules: string;
  private bashFolder: string;
  private pattern: string;
  private execService: ExecService = Container.get(ExecService);
  private argsService: ArgsService = Container.get(ArgsService);
  private configService: ConfigService = Container.get(ConfigService);

  async run(
    introspectionEndpoint?: string,
    introspectionOutputFolder?: string,
    pattern?: string
  ) {
    const originalConsole = console.log.bind(console);
    console.log = function () {
      const cwd = process.cwd().split('/');
      return originalConsole.apply(console, [
        '\x1b[36m%s\x1b[0m',
        `${cwd[cwd.length - 1]} =>`,
        // eslint-disable-next-line prefer-rest-params
        ...arguments,
      ]);
    };
    this.folder =
      introspectionOutputFolder ||
      this.configService.config.config.schema.introspectionOutputFolder;
    this.endpoint =
      introspectionEndpoint ||
      this.configService.config.config.schema.introspectionEndpoint;
    this.pattern = pattern || this.configService.config.config.schema.pattern;
    this.node_modules = __dirname.replace('dist/tasks', 'node_modules');
    this.bashFolder = __dirname.replace('dist/tasks', 'bash');
    this.headers = this.configService.config.config.schema.headers;

    if (process.argv[3] === 'introspect') {
      await this.createDir();
      await this.generateSchema();
    }

    if (
      process.argv[3] === 'collect' ||
      this.argsService.args.includes('--collect-documents')
    ) {
      await this.createDir();
      await this.collectQueries();
      await this.collectFragments();
    }
    console.log(
      `[Final] To change export folder for this command you need to check this link https://github.com/Stradivario/gapi-cli/wiki/schema`
    );
  }
  private async createDir() {
    if (!(await promisify(exists)(this.folder))) {
      await promisify(mkdirp)(this.folder);
    }
    await promisify(mkdirp)(GAPI_DAEMON_CACHE_FOLDER);
  }

  private async collectFragments() {
    console.log('[CollectFragments]: fragments collection started');
    return from(
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variables: {},
          query: `
          {
            __schema {
              types {
                kind
                name
                possibleTypes {
                  name
                }
              }
            }
          }
        `,
        }),
      })
    )
      .pipe(
        switchMap(
          (res) =>
            res.json() as Promise<{
              data: {
                __schema: {
                  types: {
                    kind: string;
                    name: string;
                    possibleTypes: { name: string };
                  }[];
                };
              };
            }>
        ),
        map((res) => res.data),
        switchMap(({ __schema }) => {
          // here we're filtering out any type information unrelated to unions or interfaces
          const filteredData = __schema.types.filter(
            (type) => type.possibleTypes !== null
          );
          __schema.types = filteredData;
          return promisify(writeFile)(
            `${this.folder}/fragmentTypes.ts`,
            `/* tslint:disable */
/* eslint-disable prettier/prettier */ 
export const introspectionQueryResultData = ${JSON.stringify(
              { __schema },
              null,
              2
            )}
          `
          );
        }),
        tap(() =>
          console.log('[CollectFragments]: fragments collection finished')
        )
      )
      .toPromise();
  }
  public async collectQueries() {
    console.log('[CollectQueries]: queries collection started');
    const randomString = Math.random().toString(36).substring(2);
    console.log(
      `[CollectQueries]: generating temporary documents file ${GAPI_DAEMON_CACHE_FOLDER}/${randomString}.json`
    );
    await this.execService.call(
      `node ${
        this.node_modules
      }/graphql-document-collector/bin/graphql-document-collector '${
        this.pattern ? this.pattern : '**/*.{graphql,gql}'
      }' > ${GAPI_DAEMON_CACHE_FOLDER}/${randomString}.json`
    );
    console.log(
      `[CollectQueries]: reading temporary documents file ${GAPI_DAEMON_CACHE_FOLDER}/${randomString}.json`
    );
    const readDocumentsTemp = await promisify(readFile)(
      `${GAPI_DAEMON_CACHE_FOLDER}/${randomString}.json`,
      'utf-8'
    );
    await promisify(unlink)(`${GAPI_DAEMON_CACHE_FOLDER}/${randomString}.json`);
    if (this.argsService.args.includes('--collect-types')) {
      console.log(`[CollectQueries]: generating types`);
      await this.generateTypes(readDocumentsTemp);
    }
    const parsedDocuments = `/* tslint:disable */\n/* eslint-disable prettier/prettier */ \nexport const DOCUMENTS = ${readDocumentsTemp};`;
    console.log(
      `[CollectQueries]: writing file to disc ${this.folder}/documents.ts`
    );
    await promisify(writeFile)(
      `${this.folder}/documents.ts`,
      parsedDocuments,
      'utf8'
    );
    if (this.argsService.args.includes('--with-compressed')) {
      await promisify(writeFile)(
        `${this.folder}/documents.compressed.ts`,
        'export const DocumentsCompressed = `' +
          LZWService.compress(JSON.parse(readDocumentsTemp)) +
          '`',
        'utf8'
      );
    }

    console.log('[CollectQueries]: queries collection finished');
  }

  public async generateSchema() {
    console.log(`[GenerateSchema]: Trying to hit ${this.endpoint} ...`);
    await this.execService.call(
      `export NODE_TLS_REJECT_UNAUTHORIZED=0 && node ${
        this.node_modules
      }/apollo-codegen/lib/cli.js introspect-schema ${this.endpoint} ${
        this.headers ? `--header "${this.headers}"` : ''
      } --output ${this.folder}/schema.json`
    );
    console.log(`[GenerateSchema]: Endpoint ${this.endpoint} hit!`);
    await this.execService.call(
      `export NODE_TLS_REJECT_UNAUTHORIZED=0 && node  ${this.bashFolder}/gql2ts/index.js ${this.folder}/schema.json -o ${this.folder}/index.ts`
    );
    console.log(
      `[GenerateSchema]: Typescript interfaces generated inside folder: ${this.folder}/index.d.ts`
    );
  }

  public async generateTypes(readDocumentsTemp) {
    const savedDocuments = Object.keys(JSON.parse(readDocumentsTemp))
      .map((key) => {
        const n = key.lastIndexOf('/');
        const result = key.substring(n + 1);
        if (result === 'ListMovies.graphql') {
          return;
        }
        if (result === 'Place.graphql') {
          return;
        }
        if (result === 'Movie.graphql') {
          return;
        }
        return result;
      })
      .filter((i) => !!i);
    const types = `/* eslint-disable prettier/prettier */

function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}
export const DocumentTypes = strEnum(${JSON.stringify(savedDocuments)
      .replace(/"/g, `'`)
      .replace(/,/g, ',\n')});
export type DocumentTypes = keyof typeof DocumentTypes;`;
    return await promisify(writeFile)(
      `${this.folder}/documentTypes.ts`,
      types,
      'utf8'
    );
  }
}
