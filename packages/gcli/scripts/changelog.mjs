#!/usr/bin/env node
/**
 * Changelog fragments, grouped by feature: one file per change.
 *
 * Every change adds its own file instead of editing one shared CHANGELOG
 * (two branches prepending to the same file conflict on every rebase; two new
 * files never do), and every entry names the FEATURE it belongs to, so the
 * whole history of one feature - what changed, how to test it, where to look
 * when it breaks - can be pulled out on demand:
 *
 *   docs/changelog.d/YYYY-MM-DD-<feature>-<slug>.md   one entry per change,
 *                                                     committed WITH the change
 *   docs/features/<feature>.md                        the feature's living doc
 *                                                     (current state, not history)
 *   docs/CHANGELOG.md                                 the archive: compacted
 *                                                     fragments, never hand-edited
 *
 *   node scripts/changelog.mjs new <feature> "<summary>" [--type feat] [--date YYYY-MM-DD]
 *         create a fragment from the template and print its path
 *   node scripts/changelog.mjs check
 *         validate every fragment - run before committing
 *   node scripts/changelog.mjs render [--feature F] [-o FILE]
 *         the full log (fragments newest-first, then the archive), or only F's
 *   node scripts/changelog.mjs features
 *         every feature with its entry count, latest entry and doc status
 *   node scripts/changelog.mjs compact [--dry-run] [--allow-branch]
 *         fold all fragments into docs/CHANGELOG.md (default branch only)
 *
 * Plain Node (>= 18), no dependencies - runs in any Node container.
 * Pattern adapted from wiener/deployment's hack/changelog.py (2026-10-07).
 */
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FRAG_DIR = join(ROOT, 'docs', 'changelog.d');
const FEATURE_DIR = join(ROOT, 'docs', 'features');
const ARCHIVE = join(ROOT, 'docs', 'CHANGELOG.md');

const NAME_RE = /^(\d{4}-\d{2}-\d{2})-([a-z0-9][a-z0-9.-]*)\.md$/;
const HEAD_RE = /^## (\d{4}-\d{2}-\d{2}) - ([a-z0-9][a-z0-9-]*): (.+)$/;
const FEATURE_LINE_RE = /\*\*Feature:\*\*\s*([a-z0-9][a-z0-9-]*)/;
const FEATURE_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const TYPES = ['feat', 'fix', 'perf', 'refactor', 'test', 'docs', 'tooling', 'repo'];
const REQUIRED = ['**Feature:**', '**Type:**', '**Test:**', '**Debug:**', '**Verification:**'];
// Changes that aren't part of any one feature (repo setup, tooling, deps).
const FEATURE_EXEMPT = ['repo'];
const PLACEHOLDERS = ['<what is now true', '<how to test', '<where to look', '<what was run'];
const DEFAULT_BRANCHES = ['main', 'master', 'develop'];

const ARCHIVE_HEADER = `# Changelog (archive)

Compacted changelog fragments, newest first. **Never edit this file by
hand** - new entries go in \`docs/changelog.d/\` (\`node scripts/changelog.mjs new\`);
only \`node scripts/changelog.mjs compact\` writes here. See
\`docs/changelog.d/README.md\`.

---
`;

const template = ({ date, feature, summary, type }) => `## ${date} - ${feature}: ${summary}

**Feature:** ${feature} · **Type:** ${type}

- <what is now true, and why - one bullet per logical change; name the
  files/modules that own it>
- **Test:** <how to test it - the specs/commands to run and what passing
  looks like; manual steps if there is no automated coverage>
- **Debug:** <where to look when it breaks - log prefixes, collections,
  env flags, the likely failure modes and their symptoms>
- **Verification:** <what was run for THIS change and its result - test
  counts, typecheck/lint, manual checks>
`;

const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

const rel = (p) => relative(ROOT, p);

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 60)
    .replace(/[-.]+$/, '');

const featureOf = (text) => text.match(FEATURE_LINE_RE)?.[1] ?? null;

const headOf = (text) => text.split('\n', 1)[0].match(HEAD_RE);

const trimEnd = (s) => s.replace(/\s+$/, '');

/** [{ path, date, text }] newest date first; filename order within a day. */
function fragments() {
  if (!existsSync(FRAG_DIR)) return [];
  const out = readdirSync(FRAG_DIR)
    .filter((n) => n.endsWith('.md') && n !== 'README.md')
    .sort()
    .map((name) => {
      const path = join(FRAG_DIR, name);
      const date = name.match(NAME_RE)?.[1] ?? '0000-00-00';
      return { path, name, date, text: trimEnd(readFileSync(path, 'utf8')) + '\n' };
    });
  // newest date first, stable filename order within a day
  return out.sort((a, b) =>
    a.date === b.date ? (a.name < b.name ? -1 : 1) : a.date < b.date ? 1 : -1,
  );
}

const readArchive = () =>
  existsSync(ARCHIVE) ? readFileSync(ARCHIVE, 'utf8') : ARCHIVE_HEADER;

/** [header lines incl. the first '---', remaining lines] */
function splitArchive() {
  const lines = readArchive().split('\n');
  const i = lines.findIndex((l) => l.trim() === '---');
  if (i === -1) die(`${rel(ARCHIVE)}: no '---' header separator found`);
  return [lines.slice(0, i + 1), lines.slice(i + 1)];
}

/** The archive's entries, split on '## YYYY-MM-DD' headings. */
function archiveEntries() {
  const [, rest] = splitArchive();
  const entries = [];
  let current = [];
  const flush = () => {
    const text = current.join('\n').trim();
    if (text) entries.push(text + '\n');
    current = [];
  };
  for (const line of rest) {
    if (HEAD_RE.test(line) && current.length) flush();
    if (line.trim() === '---' && !current.length) continue;
    current.push(line);
  }
  flush();
  return entries.filter((e) => headOf(e));
}

function compose(frags) {
  const [header, rest] = splitArchive();
  if (!frags.length) return [...header, ...rest].join('\n');
  const body = trimEnd(frags.map((f) => trimEnd(f.text) + '\n').join('\n'));
  return trimEnd([...header, '', body, '', '---', ...rest].join('\n')) + '\n';
}

function problems() {
  const errs = [];
  for (const { path, name, text } of fragments()) {
    const r = rel(path);
    const m = name.match(NAME_RE);
    if (!m) errs.push(`${r}: filename must be YYYY-MM-DD-<feature>-<slug>.md`);
    const h = headOf(text);
    if (!h) errs.push(`${r}: first line must be '## YYYY-MM-DD - <feature>: <summary>'`);
    else if (m && h[1] !== m[1])
      errs.push(`${r}: heading date ${h[1]} != filename date ${m[1]}`);
    for (const key of REQUIRED)
      if (!text.includes(key)) errs.push(`${r}: missing ${key} line`);
    const feature = featureOf(text);
    if (h && feature && h[2] !== feature)
      errs.push(`${r}: heading feature '${h[2]}' != **Feature:** '${feature}'`);
    if (feature && m && !name.slice(11).startsWith(feature + '-'))
      errs.push(`${r}: filename must start with the date then the feature (${feature})`);
    if (
      feature &&
      !FEATURE_EXEMPT.includes(feature) &&
      !existsSync(join(FEATURE_DIR, `${feature}.md`))
    )
      errs.push(`${r}: feature doc docs/features/${feature}.md is missing`);
    const type = text.match(/\*\*Type:\*\*\s*([a-z]+)/)?.[1];
    if (type && !TYPES.includes(type))
      errs.push(`${r}: **Type:** must be one of ${TYPES.join(', ')}`);
    for (const ph of PLACEHOLDERS)
      if (text.includes(ph))
        errs.push(`${r}: template placeholder still present (${ph}...>)`);
    if (text.includes('\n## '))
      errs.push(`${r}: more than one entry in a fragment - one file per change`);
  }
  const arch = readArchive();
  if (['<<<<<<< ', '\n=======\n', '>>>>>>> '].some((m) => arch.includes(m)))
    errs.push(`${rel(ARCHIVE)}: merge conflict marker present`);
  return errs;
}

function cmdNew(args, opts) {
  const [feature, summary] = args;
  if (!feature || !summary) die('usage: new <feature> "<summary>" [--type feat] [--date YYYY-MM-DD]');
  if (!FEATURE_SLUG_RE.test(feature))
    die(`feature must be kebab-case (e.g. local-ai-runners), got '${feature}'`);
  const type = opts.type ?? 'feat';
  if (!TYPES.includes(type)) die(`--type must be one of ${TYPES.join(', ')}`);
  const date = opts.date ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) die(`--date must be YYYY-MM-DD, got '${date}'`);
  const path = join(FRAG_DIR, `${date}-${feature}-${slugify(summary)}.md`);
  if (existsSync(path)) die(`${rel(path)} already exists`);
  mkdirSync(FRAG_DIR, { recursive: true });
  writeFileSync(path, template({ date, feature, summary, type }));
  console.log(rel(path));
  const doc = join(FEATURE_DIR, `${feature}.md`);
  if (!FEATURE_EXEMPT.includes(feature) && !existsSync(doc))
    console.log(
      `NOTE: ${rel(doc)} does not exist yet - create the feature doc ` +
        '(docs/features/README.md has the outline); `check` requires it.',
    );
  console.log(
    'Fill in every <...> placeholder, run `node scripts/changelog.mjs check`, ' +
      'then commit it together with the change.',
  );
}

function cmdCheck() {
  const errs = problems();
  for (const e of errs) console.error(`ERROR ${e}`);
  if (errs.length) process.exit(1);
  console.log(`OK: ${fragments().length} fragment(s) in ${rel(FRAG_DIR)}, archive clean`);
}

function cmdRender(_args, opts) {
  let out;
  if (opts.feature) {
    const entries = [
      ...fragments().map((f) => f.text).filter((t) => featureOf(t) === opts.feature),
      ...archiveEntries().filter((e) => featureOf(e) === opts.feature),
    ];
    if (!entries.length) die(`no entries for feature '${opts.feature}' (see \`features\`)`);
    const doc = join(FEATURE_DIR, `${opts.feature}.md`);
    out =
      `# ${opts.feature} - change history\n\nLiving doc: ${rel(doc)}\n\n` +
      entries.map((e) => trimEnd(e) + '\n').join('\n');
  } else {
    out = compose(fragments());
  }
  if (opts.output) {
    writeFileSync(opts.output, out);
    console.log(opts.output);
  } else {
    process.stdout.write(out);
  }
}

function cmdFeatures() {
  const stats = new Map();
  for (const text of [...fragments().map((f) => f.text), ...archiveEntries()]) {
    const f = featureOf(text) ?? '?';
    const s = stats.get(f) ?? { n: 0, latest: '' };
    s.n += 1;
    const date = headOf(text)?.[1];
    if (date && date > s.latest) s.latest = date;
    stats.set(f, s);
  }
  const docs = existsSync(FEATURE_DIR)
    ? readdirSync(FEATURE_DIR)
        .filter((n) => n.endsWith('.md') && n !== 'README.md')
        .map((n) => n.slice(0, -3))
    : [];
  for (const f of [...new Set([...stats.keys(), ...docs])].sort()) {
    const s = stats.get(f) ?? { n: 0, latest: '-' };
    const doc = docs.includes(f) ? 'doc' : FEATURE_EXEMPT.includes(f) ? '-' : 'NO DOC';
    console.log(
      `${f.padEnd(32)} ${String(s.n).padStart(3)} entr${s.n === 1 ? 'y  ' : 'ies'}  ` +
        `latest ${(s.latest || '-').padEnd(10)}  ${doc}`,
    );
  }
}

function currentBranch() {
  try {
    return execFileSync('git', ['-C', ROOT, 'symbolic-ref', '--short', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '?';
  }
}

function cmdCompact(_args, opts) {
  const errs = problems();
  if (errs.length) {
    for (const e of errs) console.error(`ERROR ${e}`);
    die('fix the fragments first (node scripts/changelog.mjs check)');
  }
  const frags = fragments();
  if (!frags.length) return console.log('nothing to compact');
  const branch = currentBranch();
  if (!DEFAULT_BRANCHES.includes(branch) && !opts['allow-branch'])
    die(
      `on branch '${branch}': compact runs on ${DEFAULT_BRANCHES.join('/')} only ` +
        '(single writer, own commit - that keeps CHANGELOG.md conflict-free). ' +
        'Use --allow-branch if you really mean it.',
    );
  console.log(`${frags.length} fragment(s) -> ${rel(ARCHIVE)}:`);
  for (const f of frags) console.log(`  ${rel(f.path)}`);
  if (opts['dry-run']) return console.log('(dry run - nothing written)');
  writeFileSync(ARCHIVE, compose(frags));
  for (const f of frags) unlinkSync(f.path);
  console.log(
    'Done. Commit it on its own:\n' +
      `  git add -A ${rel(FRAG_DIR)} ${rel(ARCHIVE)} && ` +
      `git commit -m "docs(changelog): compact ${frags.length} entries"`,
  );
}

/** Tiny argv parser: positionals + --flag / --key value / -o value. */
function parseArgs(argv) {
  const BOOL = new Set(['dry-run', 'allow-branch', 'help']);
  const args = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h') opts.help = true;
    else if (a === '-o') opts.output = argv[++i];
    else if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=', 2);
      opts[k] = BOOL.has(k) ? true : (v ?? argv[++i]);
    } else args.push(a);
  }
  return { args, opts };
}

const COMMANDS = {
  new: cmdNew,
  check: cmdCheck,
  render: cmdRender,
  features: cmdFeatures,
  compact: cmdCompact,
};

const [cmd, ...rest] = process.argv.slice(2);
const { args, opts } = parseArgs(rest);
if (!cmd || !COMMANDS[cmd] || opts.help) {
  const doc = readFileSync(fileURLToPath(import.meta.url), 'utf8').match(/\/\*\*([\s\S]*?)\*\//)[1];
  console.log(doc.replace(/^ \* ?/gm, '').trim());
  process.exit(cmd && !opts.help ? 1 : 0);
}
COMMANDS[cmd](args, opts);
