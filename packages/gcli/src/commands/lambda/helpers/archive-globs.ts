/**
 * What `gcli lambda:create|update` zips for an `uploadAsZip` lambda.
 *
 * `**` skips dotfiles on purpose: `.git`, `.env`, `.npmrc` (tokens) never
 * leave the machine. `.well-known/` is the exception: a public web standard
 * (RFC 8615 - security.txt, assetlinks.json, apple-app-site-association)
 * that a static site must be able to ship. It is added back wherever it
 * sits, outside node_modules and .git; `.gignore` still excludes it.
 * Until 1.8.284 it was silently left out (lambforge.app, 2026-11-25).
 */
export interface ArchiveGlob {
  pattern: string;
  options: { ignore: string[]; dot?: boolean; cwd?: string };
}

export const archiveGlobs = (ignore: string[], cwd?: string): ArchiveGlob[] => {
  const skip = ['.gcache/**', ...ignore];
  const at = cwd ? { cwd } : {};
  return [
    { pattern: '**', options: { ignore: skip, ...at } },
    {
      pattern: '**/.well-known/**',
      options: {
        dot: true,
        ignore: ['**/node_modules/**', '**/.git/**', ...skip],
        ...at,
      },
    },
  ];
};
