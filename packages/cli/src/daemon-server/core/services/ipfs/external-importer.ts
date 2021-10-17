/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BehaviorSubject,
  combineLatest,
  from,
  Observable,
  of,
  timer,
} from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { FileService } from '../../../../core/services/file';
import {
  ExternalImporterConfig,
  ExternalImporterIpfsConfig,
  ExternalModuleConfiguration,
} from './external-importer-config';
import { IPFS_PROVIDERS } from './providers';
import SystemJS = require('systemjs');
import { Injector, Service } from '@rxdi/core';

import { NpmService } from './npm-service';
import { RequestService } from './request';

export interface PackagesConfig {
  dependencies: string[];
  provider: string;
}

@Service()
export class ExternalImporter {
  defaultJsonFolder = `${process.cwd()}/package.json`;
  defaultTypescriptConfigJsonFolder = `${process.cwd()}/tsconfig.json`;

  @Injector(RequestService) private requestService: RequestService;
  @Injector(FileService) private fileService: FileService;
  @Injector(NpmService) private npmService: NpmService;

  providers: BehaviorSubject<
    { name: IPFS_PROVIDERS; link: string }[]
  > = new BehaviorSubject(IPFS_PROVIDERS);
  defaultProvider: string = this.getProvider('main-ipfs-node');
  defaultNamespaceFolder = '@types';
  defaultOutputFolder = 'node_modules';
  setDefaultProvider(provider: IPFS_PROVIDERS) {
    this.defaultProvider = this.getProvider(provider);
  }
  getProvider(name: IPFS_PROVIDERS) {
    return this.providers.getValue().filter((p) => p.name === name)[0].link;
  }

  setProviders(...args: { name: IPFS_PROVIDERS; link: string }[]) {
    this.providers.next([...this.providers.getValue(), ...args]);
  }

  importExternalModule(module: string) {
    return from(SystemJS.import(module));
  }

  validateConfig(config: ExternalImporterConfig) {
    if (!config) {
      throw new Error('Bootstrap: missing config');
    }
  }

  isWeb() {
    let value = false;
    try {
      if (window) {
        value = true;
      }
    } catch (e) {}
    return value;
  }

  loadTypescriptConfigJson() {
    let tsConfig: { compilerOptions?: { typeRoots?: string[] } } = {};
    try {
      tsConfig = this.fileService.readFile(
        this.defaultTypescriptConfigJsonFolder
      );
    } catch (e) {
      console.error(`
            Error in loading tsconfig.json in ${this.defaultTypescriptConfigJsonFolder}
            Error: ${e}
            Fallback to creating tsconfig.json
            `);
    }
    tsConfig.compilerOptions = tsConfig.compilerOptions || {};
    tsConfig.compilerOptions.typeRoots =
      tsConfig.compilerOptions.typeRoots || [];
    return tsConfig;
  }

  addNamespaceToTypeRoots(namespace: string) {
    const defaultNamespace = `./${this.defaultOutputFolder}/@types/${namespace}`;
    const tsConfig = this.loadTypescriptConfigJson();
    const foundNamespace = tsConfig.compilerOptions.typeRoots.filter(
      (t) => t === defaultNamespace
    ).length;
    if (!foundNamespace) {
      tsConfig.compilerOptions.typeRoots.push(defaultNamespace);
      this.writeTypescriptConfigFile(tsConfig);
    }
    return of(true);
  }

  writeTypescriptConfigFile(file) {
    this.fileService.writeFileSync(process.cwd() + '/tsconfig.json', file);
  }

  loadPackageJson() {
    let packageJson;
    try {
      packageJson = this.fileService.readFile(this.defaultJsonFolder);
    } catch (e) {
      packageJson = {};
    }
    return packageJson;
  }

  loadNpmPackageJson() {
    let packageJson;
    try {
      packageJson = this.fileService.readFile(`${process.cwd()}/package.json`);
    } catch (e) {
      packageJson = {};
    }
    return packageJson;
  }

  prepareDependencies() {
    const file = this.loadNpmPackageJson();
    if (file.dependencies) {
      return Object.keys(file.dependencies).map((name) => ({
        name,
        version: file.dependencies[name],
      }));
    }
    return [];
  }

  isModulePresent(hash) {
    const file = this.loadPackageJson();
    let ipfsConfig: PackagesConfig[] = file.ipfs;
    const found = [];
    if (!ipfsConfig) {
      ipfsConfig = this.defaultIpfsConfig();
    }
    ipfsConfig.forEach((c) => {
      const present = c.dependencies.filter((dep) => dep === hash);
      if (present.length) {
        found.push(present[0]);
      }
    });
    return found.length;
  }

  filterUniquePackages() {
    const file = this.loadPackageJson();
    let ipfsConfig: PackagesConfig[] = file.ipfs;
    let dups = [];
    if (!ipfsConfig) {
      ipfsConfig = this.defaultIpfsConfig();
    }
    ipfsConfig.forEach((c) => {
      const uniq = c.dependencies
        .map((name) => {
          return { count: 1, name: name };
        })
        .reduce((a, b) => {
          a[b.name] = (a[b.name] || 0) + b.count;
          return a;
        }, {});

      const duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1);
      dups = [...dups, ...duplicates];
    });

    if (dups.length) {
      throw new Error(
        `There are packages which are with the same hash ${JSON.stringify(
          dups
        )}`
      );
    }
    return dups.length;
  }

  defaultIpfsConfig() {
    return [{ provider: this.defaultProvider, dependencies: [] }];
  }

  addPackageToJson(hash: string) {
    const file = this.loadPackageJson();
    let ipfsConfig: PackagesConfig[] = file.ipfs;
    if (!ipfsConfig) {
      ipfsConfig = this.defaultIpfsConfig();
    }
    const packages = this.prepareDependencies();
    if (packages.length) {
      file.packages = packages;
    }
    if (this.isModulePresent(hash)) {
      console.log(
        `Package with hash: ${hash} present and will not be downloaded!`
      );
    } else {
      ipfsConfig[0].dependencies.push(hash);
      file.ipfs = ipfsConfig;
    }

    this.fileService.writeFileSync(this.defaultJsonFolder, file);
  }

  downloadIpfsModules(modules: ExternalImporterIpfsConfig[]) {
    const latest = modules.map((m) => this.downloadIpfsModule(m));
    return combineLatest(latest.length ? latest : of());
  }

  downloadIpfsModuleConfig(config: ExternalImporterIpfsConfig) {
    return this.requestService.get(config.provider + config.hash).pipe(
      map((r) => {
        if (!r) {
          throw new Error(
            'Recieved undefined from provided address' +
              config.provider +
              config.hash
          );
        }
        let res = r;
        const metaString = '<!--meta-rxdi-ipfs-module-->';
        if ((res as string).includes(metaString)) {
          try {
            res = (res as string).split(metaString)[1];
          } catch (e) {}
        }
        return res;
      }),
      map((r) => {
        let res = r;
        try {
          res = JSON.parse(r as string);
        } catch (e) {}
        return res as ExternalModuleConfiguration;
      })
    );
  }

  private combineDependencies(
    dependencies: any[],
    config: ExternalImporterIpfsConfig
  ) {
    return combineLatest([
      ...(dependencies.length
        ? dependencies.map((h) =>
            this.downloadIpfsModule({ provider: config.provider, hash: h })
          )
        : [of('')]),
    ]);
  }

  private writeFakeIndexIfMultiModule(
    folder: string,
    nameSpaceFakeIndex: string[]
  ) {
    if (nameSpaceFakeIndex.length === 2) {
      return this.fileService.writeFileAsyncP(
        `${folder}${this.defaultNamespaceFolder}/${nameSpaceFakeIndex[0]}`,
        'index.d.ts',
        ''
      );
    } else {
      return of(true);
    }
  }

  downloadIpfsModule(config: ExternalImporterIpfsConfig) {
    if (!config.provider) {
      throw new Error(`Missing configuration inside ${config.hash}`);
    }

    if (!config.hash) {
      throw new Error(`Missing configuration inside ${config.provider}`);
    }
    let folder: string;
    let moduleLink: string;
    const configLink = config.provider + config.hash;
    let moduleTypings: string;
    let moduleName: string;
    let nameSpaceFakeIndex: string[];
    let originalModuleConfig: ExternalModuleConfiguration;
    let isNamespace: boolean;
    let isRegular: string;
    return this.downloadIpfsModuleConfig(config).pipe(
      tap((res) => {
        if (!res['module']) {
          console.log(
            'Todo: create logic to load module which is not from rxdi infrastructure for now can be used useDynamic which will do the same job!'
          );
        }
      }),
      filter((res: ExternalModuleConfiguration) => !!res.module),
      map((externalModule: ExternalModuleConfiguration) => {
        moduleName = externalModule.name;
        nameSpaceFakeIndex = moduleName.split('/');
        folder = `${process.cwd()}/${this.defaultOutputFolder}/`;
        moduleLink = `${config.provider}${externalModule.module}`;
        moduleTypings = `${config.provider}${externalModule.typings}`;
        externalModule.dependencies = externalModule.dependencies || [];
        externalModule.packages = externalModule.packages || [];
        originalModuleConfig = externalModule;
        this.npmService.setPackages(externalModule.packages);
        isNamespace = moduleName.split('/').length === 2;
        isRegular = isNamespace ? moduleName : moduleName.split('/')[0];
        console.log(
          `Package config for module ${moduleName} downloaded! ${JSON.stringify(
            externalModule
          )}`
        );
        return externalModule;
      }),
      switchMap((externalModule) =>
        this.combineDependencies(externalModule.dependencies, config)
      ),
      switchMap(() => {
        console.log(`--------------------${moduleName}--------------------`);
        console.log(`\nDownloading... ${configLink} `);
        console.log(
          `Config: ${JSON.stringify(originalModuleConfig, null, 2)} \n`
        );
        return this.requestService.get(moduleLink);
      }),
      switchMap((file) =>
        this.fileService.writeFile(
          folder + moduleName,
          'index.js',
          moduleName,
          file
        )
      ),
      switchMap(() => this.requestService.get(moduleTypings)),
      switchMap((file) =>
        this.fileService.writeFile(
          folder + `${this.defaultNamespaceFolder}/${isRegular}`,
          'index.d.ts',
          moduleName,
          file
        )
      ),
      tap(() => {
        if (process.env.WRITE_FAKE_INDEX) {
          this.writeFakeIndexIfMultiModule(folder, nameSpaceFakeIndex);
        }
      }),
      switchMap(() => this.addNamespaceToTypeRoots(moduleName.split('/')[0])),
      map(() => ({
        provider: config.provider,
        hash: config.hash,
        version: originalModuleConfig.version,
        name: originalModuleConfig.name,
        dependencies: originalModuleConfig.dependencies,
        packages: originalModuleConfig.packages,
      })),
      tap(() => {
        if (originalModuleConfig.packages.length) {
          this.npmService.installPackages();
        }
      })
    );
  }

  downloadTypings(
    moduleLink: string,
    folder: string,
    fileName: string,
    config: ExternalImporterConfig
  ) {
    if (!moduleLink) {
      return of(true);
    }
    return this.requestService.get(moduleLink).pipe(
      take(1),
      map((res) => {
        console.log(`Done!`);
        return res;
      }),
      switchMap((res) =>
        this.fileService.writeFile(
          folder,
          fileName,
          config.typingsFileName,
          res
        )
      )
    );
  }

  importModule(
    config: ExternalImporterConfig,
    token: string,
    { folderOverride, waitUntil } = {} as any
  ): Promise<any> {
    const timer$ = timer(waitUntil || 20 * 1000);
    this.validateConfig(config);
    if (this.isWeb()) {
      SystemJS.config(
        Object.assign(
          {
            map: {
              [token]: config.link,
            },
          },
          config.SystemJsConfig
        )
      );
      return SystemJS.import(config.link);
    }
    return new Observable((observer) => {
      const moduleName = config.fileName;
      const moduleNamespace = config.namespace;
      const moduleLink = config.link;
      const moduleExtension = config.extension;
      const moduleSystemJsConfig = config.SystemJsConfig || {};
      const modulesFolder =
        config.outputFolder || `/${this.defaultOutputFolder}/`;
      const fileFullPath = `${
        folderOverride || process.cwd()
      }${modulesFolder}/${moduleNamespace}/${moduleName}.${moduleExtension}`;
      const folder = `${
        folderOverride || process.cwd()
      }${modulesFolder}${moduleNamespace}`;
      const fileName = `${moduleName}.${moduleExtension}`;

      Object.assign(moduleSystemJsConfig, {
        paths: { [moduleName]: fileFullPath, ...moduleSystemJsConfig.paths },
      });

      SystemJS.config(moduleSystemJsConfig);

      if (this.fileService.isPresent(fileFullPath)) {
        console.log(
          `Bootstrap -> @Service('${moduleName}'): present inside .${modulesFolder}${moduleNamespace}/${moduleName}.${moduleExtension} folder and loaded from there`
        );
        this.importExternalModule(moduleName)
          .pipe(take(1))
          .subscribe(
            (m) => {
              observer.next(m);
              observer.complete();
            },
            (err) => {
              observer.error(err);
              observer.complete();
            }
          );
      } else {
        console.log(
          `Bootstrap -> @Service('${moduleName}'): will be downloaded inside .${modulesFolder}${moduleNamespace}/${moduleName}.${moduleExtension} folder and loaded from there`
        );
        console.log(
          `Bootstrap -> @Service('${moduleName}'): ${moduleLink} downloading...`
        );
        this.requestService
          .get(moduleLink)
          .pipe(
            take(1),
            tap(() => console.log(`Done!`)),
            switchMap((res) =>
              this.fileService.writeFile(folder, fileName, config.fileName, res)
            ),
            switchMap(() =>
              this.downloadTypings(config.typings, folder, fileName, config)
            ),
            switchMap(() => this.importExternalModule(moduleName))
          )
          .subscribe(
            (m) => {
              observer.next(m);
              observer.complete();
            },
            (err) => {
              observer.error(err);
              observer.complete();
            }
          );
      }
    })
      .pipe(takeUntil(timer$))
      .toPromise();
  }
}
