// Translation review sheet for fluent speakers, with no account or platform needed.
//
//   pnpm i18n:sheet                     writes review/ja-review.csv (open in Excel or Google Sheets)
//   pnpm i18n:sheet --import FILE.csv --by "Reviewer name"
//
// The sheet lists every app text key with the English, the Japanese (plain, and with furigana
// readings), and whether it is new, changed since review, or already reviewed. The reviewer types
// "yes" in the OK column, or writes a correction. Import marks the "yes" rows as reviewed in
// app/i18n/review.json (same record as `pnpm i18n:status --mark-reviewed`) and writes corrections to
// review/ja-corrections.md for whoever edits the dictionary. Static pages are reviewed with
// `pnpm i18n:status` (see docs/translation-status.md).
// A hosted platform (Weblate, Tolgee) can take the same CSV later if reviewers prefer one.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import '../patient-text/ts-resolve.mjs';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const REVIEW = join(root, 'app/i18n/review.json');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : undefined; };
const hash = (s) => createHash('sha1').update(String(s)).digest('hex').slice(0, 10);
const flat = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flat(v, key, out); else out[key] = v;
  }
  return out;
};
const load = async (lang) => flat((await import(pathToFileURL(join(root, 'app/i18n/dictionaries', `${lang}.ts`)).href)).default);
const plain = (s) => String(s).replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');
const readings = (s) => [...String(s).matchAll(/\{([^{}|]+)\|([^{}]+)\}/g)].map((m) => `${m[1]}=${m[2]}`).join(' ');
const csvCell = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const en = await load('en');
const ja = await load('ja');
const review = JSON.parse(await readFile(REVIEW, 'utf8').catch(() => '{}'));
const status = (key) => (!review[key] ? 'new' : review[key].hash === hash(ja[key]) ? 'reviewed' : 'changed since review');
await mkdir(join(root, 'review'), { recursive: true });

if (args.includes('--import')) {
  const file = opt('--import'); const by = opt('--by');
  if (!file || !by) { console.error('Usage: --import FILE.csv --by "Reviewer name"'); process.exit(2); }
  const rows = parseCsv((await readFile(file, 'utf8')).replace(/^﻿/, ''));
  const head = rows.shift().map((h) => h.trim().toLowerCase());
  const col = (name) => head.findIndex((h) => h.startsWith(name));
  const [kKey, kOk, kFix, kNote] = [col('key'), col('ok'), col('correction'), col('note')];
  const date = new Date().toISOString().slice(0, 10);
  let marked = 0; const fixes = [];
  for (const r of rows) {
    const key = r[kKey]?.trim(); if (!key || !(key in ja)) continue;
    const ok = /^(yes|y|ok|はい|✓)$/i.test((r[kOk] || '').trim());
    if (ok && !(r[kFix] || '').trim()) { review[key] = { by, date, hash: hash(ja[key]) }; marked++; }
    else if ((r[kFix] || '').trim()) fixes.push({ key, now: ja[key], fix: r[kFix].trim(), note: (r[kNote] || '').trim() });
  }
  await writeFile(REVIEW, JSON.stringify(Object.fromEntries(Object.entries(review).sort()), null, 1) + '\n');
  const md = [`# Japanese corrections from ${by} (${date})`, '', 'Apply each in app/i18n/dictionaries/ja.ts (keep furigana as {漢字|かんじ}), then send the row back for a final yes.', ''];
  for (const f of fixes) md.push(`## ${f.key}`, '', `- Now: ${f.now}`, `- Correction: ${f.fix}`, ...(f.note ? [`- Note: ${f.note}`] : []), '');
  if (fixes.length) await writeFile(join(root, 'review/ja-corrections.md'), md.join('\n'));
  console.log(`Marked ${marked} keys as reviewed by ${by}. ${fixes.length} corrections${fixes.length ? ' in review/ja-corrections.md' : ''}.`);
} else {
  const order = { new: 0, 'changed since review': 1, reviewed: 2 };
  const keys = Object.keys(en).filter((k) => typeof en[k] === 'string' && k in ja && /[A-Za-z]/.test(en[k]))
    .sort((a, b) => order[status(a)] - order[status(b)] || a.localeCompare(b));
  const lines = [['Key', 'Status', 'English', 'Japanese', 'Furigana readings', 'OK? (yes)', 'Correction', 'Note'].map(csvCell).join(',')];
  for (const k of keys) lines.push([k, status(k), plain(en[k]), plain(ja[k]), readings(ja[k]), '', '', ''].map(csvCell).join(','));
  // BOM so Excel opens the Japanese text correctly.
  await writeFile(join(root, 'review/ja-review.csv'), '﻿' + lines.join('\r\n') + '\r\n');
  const counts = keys.reduce((c, k) => ((c[status(k)] = (c[status(k)] || 0) + 1), c), {});
  console.log(`review/ja-review.csv: ${keys.length} rows`, counts);
}
