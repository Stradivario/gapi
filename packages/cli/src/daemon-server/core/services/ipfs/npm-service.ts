import { BehaviorSubject } from 'rxjs';

import childProcess = require('child_process');
import { Service } from '@rxdi/core';

import { NpmPackageConfig } from './external-importer-config';

@Service()
export class NpmService {
  packagesToDownload: BehaviorSubject<NpmPackageConfig[]> = new BehaviorSubject(
    []
  );
  packages: string[] = [];
  child: childProcess.ChildProcess;

  setPackages(packages: NpmPackageConfig[]) {
    this.packagesToDownload.next([
      ...this.packagesToDownload.getValue(),
      ...packages,
    ]);
  }

  preparePackages() {
    const arr = this.packagesToDownload.getValue() || [];
    this.packages = [...new Set(arr.map((p) => `${p.name}@${p.version}`))];
  }

  installPackages() {
    return new Promise(() => {
      this.preparePackages();
      if (this.child) {
        this.child.stdout.removeAllListeners('data');
        this.child.stderr.removeAllListeners('data');
        this.child.removeAllListeners('exit');
        this.child.kill();
      }
      console.log(
        `Installing npm packages on child process! ${this.packages.toString()}`
      );
      this.child = childProcess.spawn('npm', ['i', ...this.packages]);
      this.child.stdout.on('data', (data) => process.stdout.write(data));
      this.child.stderr.on('data', (data) => {
        process.stdout.write(data);
        // reject(data)
      });
      this.child.on('exit', (code) => {
        console.log(`Child process exited with code ${code}`);
        console.log(
          `Installing npm packages DONE! ${this.packages.toString()}`
        );
        this.child = null;
      });
    });
  }
}
