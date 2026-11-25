# lambda-upload-zip

What `gcli lambda:create` / `lambda:update` put in the upload when the spec
has `uploadAsZip: true` (`src/commands/lambda/package.ts`, globs in
`src/commands/lambda/helpers/archive-globs.ts`).

- Everything under the current folder (`**`), minus `.gcache/**` and the
  `.gignore` patterns.
- **Dotfiles stay out** (`.git`, `.env`, `.npmrc` with tokens, editor
  folders) - on purpose, never change that.
- **Except `.well-known/`** (RFC 8615: `security.txt`, `assetlinks.json`,
  `apple-app-site-association`), anywhere in the tree, so a static site can
  serve `/.well-known/...`. Never from `node_modules` or `.git`; a
  `.gignore` pattern still removes it. Since 1.8.284 - before that it was
  silently skipped and a site had to ship `well-known/` and rename it in
  `build.sh` (graphql-server-functions `packages/lambforge-app`, 2026-11-25).

**Test:** `npx jest test/archive-globs.spec.ts`.
**Debug:** the zip is written to `.gcache/<name>.zip` before the upload -
`unzip -l .gcache/<name>.zip` shows exactly what was sent.
