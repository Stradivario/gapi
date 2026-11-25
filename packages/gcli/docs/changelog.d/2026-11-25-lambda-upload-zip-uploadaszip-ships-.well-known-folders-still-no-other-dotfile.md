## 2026-11-25 - lambda-upload-zip: uploadAsZip ships .well-known/ folders (still no other dotfiles)

**Feature:** lambda-upload-zip · **Type:** feat

- `uploadAsZip` uploads now include `.well-known/` folders wherever they sit (`src/commands/lambda/helpers/archive-globs.ts`, used by `package.ts`): a static site can serve `/.well-known/security.txt` and friends. Every other dotfile (`.git`, `.env`, `.npmrc`) stays out; never from `node_modules` / `.git`; `.gignore` still wins. Before, `**` skipped the folder without a word (lambforge.app had to ship `well-known/` and rename it in `build.sh`).
- **Test:** `npx jest test/archive-globs.spec.ts` - root and nested `.well-known` zipped, `.env` / `.npmrc` / `.git` / `.gcache` not, node_modules' `.well-known` not, a `.gignore` pattern removes it.
- **Debug:** `unzip -l .gcache/<name>.zip` after a deploy shows exactly what was uploaded.
- **Verification:** archive-globs.spec.ts 3/3 passed; eslint + `tsc --noEmit` clean.
