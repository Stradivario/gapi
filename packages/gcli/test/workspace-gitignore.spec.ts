import 'jest';

import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { WorkspaceFiles } from '../src/commands/workspace/files';
import { GitignoreMatcher } from '../src/commands/workspace/gitignore';

/* .gitignore without git (plain folders, no git installed) - plan 36. */
describe('[workspace] gitignore matcher', () => {
  const matcher = (files: Record<string, string>) =>
    new GitignoreMatcher('/r', (path) => {
      const rel = path.replace(/^\/r\/?/, '');
      if (!(rel in files)) throw new Error('ENOENT');
      return files[rel];
    });

  it.each([
    // pattern, path, isDir, ignored
    ['dist/', 'dist/main.js', false, true],
    ['dist/', 'dist', false, false], // a FILE named dist: dir-only rule
    ['dist/', 'packages/app/dist/x.js', false, true], // any depth
    ['/dist', 'packages/dist/x.js', false, false], // anchored to the root
    ['*.log', 'logs/server.log', false, true],
    ['*.log\n!keep.log', 'keep.log', false, false], // negation
    ['.parcel-cache', '.parcel-cache/data.mdb', false, true],
    ['build/**/*.map', 'build/a/b/c.js.map', false, true],
    ['**/tmp', 'a/b/tmp/x', false, true],
    ['doc/*.txt', 'doc/a/b.txt', false, false], // * does not cross /
    ['file[0-9].txt', 'file7.txt', false, true],
    ['# comment\n\n.env', '.env', false, true],
    ['\\#notes', '#notes', false, true],
  ])('%j ignores %s (dir %s): %s', (pattern, path, isDir, ignored) => {
    expect(matcher({ '.gitignore': pattern }).ignored(path, isDir)).toBe(
      ignored,
    );
  });

  it('nothing inside an ignored folder comes back', () => {
    const m = matcher({ '.gitignore': 'dist/\n!dist/keep.js' });
    expect(m.ignored('dist/keep.js')).toBe(true);
  });

  it('a nested .gitignore applies below its folder and wins', () => {
    const m = matcher({
      '.gitignore': '*.gen.ts',
      'packages/app/.gitignore': '!*.gen.ts\nout/',
    });
    expect(m.ignored('src/a.gen.ts')).toBe(true);
    expect(m.ignored('packages/app/src/a.gen.ts')).toBe(false);
    expect(m.ignored('packages/app/out/x.js')).toBe(true);
    expect(m.ignored('packages/lib/out/x.js')).toBe(false);
  });
});

describe('[workspace] a folder without git honours .gitignore', () => {
  let root: string;
  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), 'gcli-nogit-')));
    writeFileSync(join(root, '.gitignore'), 'dist/\n.parcel-cache\n');
    mkdirSync(join(root, 'dist'));
    mkdirSync(join(root, '.parcel-cache'));
    mkdirSync(join(root, 'src'));
    writeFileSync(join(root, 'dist', 'bundle.js'), 'x');
    writeFileSync(join(root, '.parcel-cache', 'data.mdb'), 'x');
    writeFileSync(join(root, 'src', 'main.ts'), 'x');
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('the watcher filter drops ignored paths', async () => {
    const files = new WorkspaceFiles(root);
    await expect(
      files.notIgnored([
        'dist/bundle.js',
        '.parcel-cache/data.mdb',
        'src/main.ts',
        'node_modules/x/index.js',
      ]),
    ).resolves.toEqual(['src/main.ts']);
  });

  it('the listing skips ignored folders', async () => {
    const files = new WorkspaceFiles(root);
    const listed = (await files.list({ recursive: true })) as {
      entries?: { path: string }[];
      files?: { path: string }[];
    };
    const paths = (listed.files ?? listed.entries ?? []).map((e) => e.path);
    expect(paths).toContain('src/main.ts');
    // size + modification time: the browser's file cache compares them
    const main = (listed.files ?? listed.entries ?? []).find(
      (e) => e.path === 'src/main.ts',
    ) as { size?: number; mtimeMs?: number };
    expect(main.size).toBe(1);
    expect(main.mtimeMs).toEqual(expect.any(Number));
    expect(paths.some((p) => /^(dist|\.parcel-cache)\//.test(p))).toBe(false);
  });

  it('re-reads the rules when .gitignore itself changes', async () => {
    const files = new WorkspaceFiles(root);
    await files.notIgnored(['src/main.ts']);
    writeFileSync(join(root, '.gitignore'), 'src/\n');
    await expect(
      files.notIgnored(['.gitignore', 'src/main.ts']),
    ).resolves.toEqual(['.gitignore']);
  });
});
