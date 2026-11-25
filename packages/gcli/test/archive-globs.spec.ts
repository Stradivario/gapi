import 'jest';

import * as archiver from 'archiver';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';

import { archiveGlobs } from '../src/commands/lambda/helpers/archive-globs';

/* What lambda:create|update puts in the upload zip (uploadAsZip). */
describe('[lambda] upload zip contents', () => {
  let dir: string;

  const files = (paths: string[]) =>
    paths.forEach((p) => {
      mkdirSync(dirname(join(dir, p)), { recursive: true });
      writeFileSync(join(dir, p), p);
    });

  const zipped = (ignore: string[] = []) =>
    new Promise<string[]>((resolve, reject) => {
      const names: string[] = [];
      const archive = archiver('zip');
      archive.on('entry', (e) => names.push(e.name));
      archive.on('error', reject);
      archive.on('data', () => undefined);
      // folders are entries too; compare the files
      archive.on('end', () =>
        resolve(names.filter((n) => !n.endsWith('/')).sort()),
      );
      archiveGlobs(ignore, dir).forEach(({ pattern, options }) =>
        archive.glob(pattern, options),
      );
      archive.finalize();
    });

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'gcli-zip-'));
    files([
      'index.html',
      'site/.well-known/security.txt',
      '.well-known/assetlinks.json',
      '.env',
      '.npmrc',
      '.git/config',
      '.gcache/old.zip',
      'node_modules/x/.well-known/a.txt',
      'node_modules/x/index.js',
    ]);
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('ships .well-known folders but no other dotfiles', async () => {
    const names = await zipped(['node_modules/**']);
    expect(names).toEqual([
      '.well-known/assetlinks.json',
      'index.html',
      'site/.well-known/security.txt',
    ]);
  });

  it('never takes .well-known from node_modules, even when not ignored', async () => {
    const names = await zipped();
    expect(names).toContain('node_modules/x/index.js');
    expect(names).not.toContain('node_modules/x/.well-known/a.txt');
  });

  it('.gignore still excludes a .well-known folder', async () => {
    const names = await zipped(['node_modules/**', 'site/**']);
    expect(names).toEqual(['.well-known/assetlinks.json', 'index.html']);
  });
});
