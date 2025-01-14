/* eslint-disable @typescript-eslint/no-explicit-any */
export type Tasks =
  | '--inspect'
  | '--iport'
  | '--ihost'
  | '--buildOnly=false'
  | '--minify=false'
  | '--start'
  | '--outDir'
  | '--outFile'
  | '--hmr'
  | '--public-url'
  | '--glob'
  | 'add'
  | '--lint'
  | 'clean'
  | 'restart'
  | 'list'
  | '--url'
  | '--folder'
  | '--pattern'
  | '--all'
  | '--link-name'
  | 'start'
  | 'status'
  | 'unlink'
  | 'link'
  | 'bootstrap'
  | '--dry-run'
  | '--force'
  | '--source-root'
  | '--language'
  | '--schematics-name'
  | '--method'
  | 'remove'
  | 'kill'
  | 'stop'
  | '--port'
  | '--bundle-modules'
  | '--disable-excluded-folders'
  | '--inspect-brk'
  | '--path'
  | '--pkg-name'
  | '--ncc-only'
  | '--pkg-only'
  | '--assets'
  | '--single-executable'
  | '--target=browser'
  | '--auto-install'
  | '--hmr-port'
  | '--cache-dir'
  | '--cache'
  | '--source-maps'
  | '--hmr-hostname'
  | '--scope-hoist';

export const includes = (i: Tasks) => process.argv.toString().includes(i);
export const nextOrDefault = (i: Tasks, fb: any = true, type = (p) => p) => {
  if (process.argv.toString().includes(i)) {
    const isNextArgumentPresent = process.argv[process.argv.indexOf(i) + 1];
    if (!isNextArgumentPresent) {
      return fb;
    }
    if (isNextArgumentPresent.includes('--')) {
      return fb;
    }
    return type(isNextArgumentPresent);
  }
  return fb;
};

export * from './is-windows';
