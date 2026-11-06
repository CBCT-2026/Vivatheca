// Translation status: which Japanese strings are missing, look untranslated, or have changed since a
// fluent speaker reviewed them. Writes docs/translation-status.md and tools/i18n/status.json.
//
//   pnpm i18n:status                      report (exit 1 if a static page is missing Japanese keys)
//   pnpm i18n:status --mark-reviewed --by "Name" --keys learn.intro,about.heading
//   pnpm i18n:status --mark-reviewed --by "Name" --prefix learn.      (every key under learn.)
//   pnpm i18n:status --mark-reviewed --by "Name" --page head-neck/scc  (every key of a static page)
//
// Review records live in app/i18n/review.json as key -> { by, date, hash }, where hash is of the
// Japanese text at review time, so any later edit shows as "changed since review".
// (Modelled on Lunaria's source-hash tracking; Lunaria itself tracks whole files per locale, which does
// not fit the key-based dictionaries here.)
import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import '../patient-text/ts-resolve.mjs';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const REVIEW = join(root, 'app/i18n/review.json');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : undefined; };
const hash = (s) => createHash('sha1').update(String(s)).digest('hex').slice(0, 10);

// ---- dictionaries (app pages) ----
const flat = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flat(v, key, out); else out[key] = v;
  }
  return out;
};
const load = async (lang) => flat((await import(pathToFileURL(join(root, 'app/i18n/dictionaries', `${lang}.ts`)).href)).default);
const en = await load('en');
const ja = await load('ja');

// ---- static pages (public/<page>/index.html + Japanese text in ja.js or an inline `const ja = {`) ----
async function staticPages() {
  const pub = join(root, 'public');
  const pages = [];
  const isPage = async (dir) => { try { return (await stat(join(pub, dir, 'index.html'))).isFile(); } catch { return false; } };
  for (const name of (await readdir(pub)).sort()) {
    if (['vendor', 'pagefind'].includes(name)) continue;
    if (await isPage(name)) pages.push(name);
    let subs = [];
    try { if ((await stat(join(pub, name))).isDirectory()) subs = (await readdir(join(pub, name))).sort(); } catch { /* file */ }
    for (const sub of subs) if (await isPage(`${name}/${sub}`)) pages.push(`${name}/${sub}`);
  }
  return pages;
}

async function japaneseKeys(dir) {
  // ja.js sets window.VIVA_JA (generated pages) or window.VT_JA (hand-written pages); inline engines keep `const ja = {...}`.
  const files = (await readdir(dir)).filter((f) => f.endsWith('.js'));
  for (const f of files) {
    const src = await readFile(join(dir, f), 'utf8');
    if (!/VIVA_JA|VT_JA|const ja = \{/.test(src)) continue;
    if (/(VIVA_JA|VT_JA)\s*=/.test(src)) {
      const sandbox = { window: {}, document: { cookie: '', documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, addEventListener: () => {} } };
      try { vm.runInNewContext(src, sandbox, { timeout: 2000 }); } catch { /* page scripts need a browser; keys read below */ }
      const found = sandbox.window.VIVA_JA || sandbox.window.VT_JA;
      if (found) return { file: f, text: found };
    }
    const m = src.match(/const ja = \{([\s\S]*?)\n  \};/);
    if (m) {
      const text = {};
      for (const line of m[1].split('\n')) { const k = line.match(/^ {4}'?([A-Za-z0-9_]+)'?:\s*(.+?),?$/); if (k) text[k[1]] = k[2]; }
      return { file: f, text };
    }
  }
  return null;
}

const review = JSON.parse(await readFile(REVIEW, 'utf8').catch(() => '{}'));
const pages = await staticPages();
const pageReports = [];
for (const page of pages) {
  const html = await readFile(join(root, 'public', page, 'index.html'), 'utf8');
  // Keys whose English text has no words (numbers, units, symbols) are the same in Japanese and need no entry.
  const needed = new Set();
  for (const m of html.matchAll(/data-i18n(?:-alt)?="([^"]+)"[^>]*>([^<]*)/g)) { if (/[A-Za-z]{3,}/.test(m[2]) || html.includes(`data-i18n-alt="${m[1]}"`)) needed.add(m[1]); }
  const have = await japaneseKeys(join(root, 'public', page));
  if (!needed.size) { pageReports.push({ page, tracked: false, note: have ? 'no data-i18n keys' : 'translations live in the page script, not tracked by key' }); continue; }
  const texts = have?.text || {};
  const missing = [...needed].filter((k) => !(k in texts));
  const keys = [...needed].filter((k) => k in texts).map((k) => ({ key: `page:${page}:${k}`, ja: texts[k] }));
  pageReports.push({ page, tracked: true, file: have?.file, needed: needed.size, missing, keys });
}

// ---- review marking ----
const markable = [
  ...Object.keys(ja).map((k) => ({ key: k, ja: ja[k] })),
  ...pageReports.flatMap((p) => p.keys || []),
];
if (args.includes('--mark-reviewed')) {
  const by = opt('--by');
  if (!by) { console.error('--mark-reviewed needs --by "Name"'); process.exit(2); }
  const keys = opt('--keys')?.split(',') || [];
  const prefix = opt('--prefix');
  const page = opt('--page');
  const chosen = markable.filter((m) => keys.includes(m.key) || (prefix && m.key.startsWith(prefix)) || (page && m.key.startsWith(`page:${page}:`)));
  if (!chosen.length) { console.error('No keys matched'); process.exit(2); }
  const date = new Date().toISOString().slice(0, 10);
  for (const m of chosen) review[m.key] = { by, date, hash: hash(m.ja) };
  await writeFile(REVIEW, JSON.stringify(Object.fromEntries(Object.entries(review).sort()), null, 1) + '\n');
  console.log(`Marked ${chosen.length} keys as reviewed by ${by} on ${date}.`);
}

// ---- status ----
const status = (key, text) => {
  const r = review[key];
  if (!r) return 'unreviewed';
  return r.hash === hash(text) ? 'reviewed' : 'changed';
};
const looksUntranslated = (k) => typeof en[k] === 'string' && en[k] === ja[k] && /[A-Za-z]{4,}/.test(en[k]) && !/\.id$/.test(k) && !/^https?:|^[\w.-]+@|^[A-Z][\w-]*$/.test(en[k]);
const dict = {
  total: Object.keys(en).length,
  extraInJa: Object.keys(ja).filter((k) => !(k in en)),
  missing: Object.keys(en).filter((k) => !(k in ja)),
  untranslated: Object.keys(ja).filter(looksUntranslated),
  byStatus: { reviewed: 0, changed: 0, unreviewed: 0 },
  changed: [],
};
for (const k of Object.keys(ja)) { const s = status(k, ja[k]); dict.byStatus[s]++; if (s === 'changed') dict.changed.push(k); }
for (const p of pageReports.filter((p) => p.tracked)) {
  p.byStatus = { reviewed: 0, changed: 0, unreviewed: 0 };
  for (const { key, ja: text } of p.keys) p.byStatus[status(key, text)]++;
}

const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0);
const lines = [];
lines.push('# Translation status (English → Japanese)', '', `Generated by \`pnpm i18n:status\` on ${new Date().toISOString().slice(0, 10)}. "Reviewed" means a fluent Japanese-speaking clinician marked the text (\`--mark-reviewed\`); "changed" means it was edited after that review.`, '');
lines.push('## App pages (app/i18n/dictionaries)', '', `| Keys | Missing in ja | Same as English (untranslated?) | Reviewed | Changed since review | Unreviewed |`, `|---|---|---|---|---|---|`,
  `| ${dict.total} | ${dict.missing.length} | ${dict.untranslated.length} | ${dict.byStatus.reviewed} (${pct(dict.byStatus.reviewed, dict.total)}%) | ${dict.byStatus.changed} | ${dict.byStatus.unreviewed} |`, '');
if (dict.missing.length) lines.push('Missing: ' + dict.missing.map((k) => `\`${k}\``).join(', '), '');
if (dict.extraInJa.length) lines.push('Only in Japanese (no English source): ' + dict.extraInJa.map((k) => `\`${k}\``).join(', '), '');
if (dict.untranslated.length) lines.push('Same text as English (check whether a translation is needed): ' + dict.untranslated.slice(0, 40).map((k) => `\`${k}\``).join(', ') + (dict.untranslated.length > 40 ? ` and ${dict.untranslated.length - 40} more` : ''), '');
if (dict.changed.length) lines.push('Changed since review: ' + dict.changed.map((k) => `\`${k}\``).join(', '), '');
lines.push('## Static model pages (public/*/index.html)', '', '| Page | Japanese file | Keys | Missing in ja | Reviewed | Changed | Unreviewed |', '|---|---|---|---|---|---|---|');
for (const p of pageReports) {
  if (!p.tracked) { lines.push(`| ${p.page} | – | – | – | ${p.note} | | |`); continue; }
  lines.push(`| ${p.page} | ${p.file || 'none'} | ${p.needed} | ${p.missing.length ? p.missing.map((k) => `\`${k}\``).join(', ') : 0} | ${p.byStatus.reviewed} | ${p.byStatus.changed} | ${p.byStatus.unreviewed} |`);
}
lines.push('', '## How to review', '', 'A fluent Japanese-speaking clinician reads the page in Japanese, fixes the text in `app/i18n/dictionaries/ja.ts` or the page\'s `ja.js`, then records the review:', '', '```', 'pnpm i18n:status --mark-reviewed --by "Name" --prefix learn.        # dictionary keys under learn.', 'pnpm i18n:status --mark-reviewed --by "Name" --page head-neck/scc   # one static page', '```', '', 'The disclaimer translations (`disclaimer.*`) need this review before public launch.', '');
await writeFile(join(root, 'docs/translation-status.md'), lines.join('\n'));
await writeFile(join(root, 'tools/i18n/status.json'), JSON.stringify({ dictionary: dict, pages: pageReports.map(({ keys, ...p }) => p) }, null, 1) + '\n');

console.log(`Dictionary: ${dict.total} keys, ${dict.missing.length} missing, ${dict.untranslated.length} same as English, ${dict.byStatus.reviewed} reviewed, ${dict.byStatus.changed} changed since review.`);
for (const p of pageReports) console.log(p.tracked ? `${p.page}: ${p.needed} keys, ${p.missing.length} missing, ${p.byStatus.reviewed} reviewed` : `${p.page}: ${p.note}`);
const broken = pageReports.filter((p) => p.tracked && p.missing.length);
if (dict.missing.length || broken.length) { console.error('Japanese text is missing (see docs/translation-status.md).'); process.exit(1); }
