// Furigana check for Japanese text (free, no AI). Furigana are written {漢字|かんじ}.
//   pnpm i18n:furigana            report; exit 1 only on broken markup
//   pnpm i18n:furigana --strict   also exit 1 on reading mismatches
// Checks:
//  1. Markup: every {…|…} has kanji on the left and only kana on the right; no stray braces.
//  2. Reading: the reading is accepted if JMdict lists the word with it, or if it can be built from
//     each kanji's KANJIDIC on/kun readings (with sound changes: rendaku が/ざ/だ/ば/ぱ, small っ).
//     Anything else is listed for a fluent speaker to confirm (warning, not failure).
//     Data: kanji-data (MIT), from EDRDG's JMdict/KANJIDIC under the EDRDG licence; used only in
//     this check, never shipped on the site.
//  3. Coverage: kanji with no furigana in visible text (meta and aria/alt text are exempt).
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import '../patient-text/ts-resolve.mjs';

const require = createRequire(import.meta.url);
const kd = require('kanji-data');
const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const strict = process.argv.includes('--strict');

const flat = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flat(v, key, out); else if (typeof v === 'string') out[key] = v;
  }
  return out;
};
const ja = flat((await import(pathToFileURL(join(root, 'app/i18n/dictionaries/ja.ts')).href)).default);

const KANJI = /[㐀-䶿一-鿿々]/; // 々 counts as kanji
const KANA = /^[ぁ-ゟ゠-ヿー・]+$/;
const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const exemptKey = (k) => /^meta\.|(^|\.)(aria|alt|label)[A-Z]?\w*$|\.(id|href|src|url)$/.test(k);

const hira = (s) => toHira(s).replace(/[-.].*$|^-/g, '').replace(/-/g, '');
const voiced = { か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご', さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ', た: 'だ', ち: 'ぢ', つ: 'づ', て: 'で', と: 'ど', は: 'ば', ひ: 'び', ふ: 'ぶ', へ: 'べ', ほ: 'ぼ' };
const half = { は: 'ぱ', ひ: 'ぴ', ふ: 'ぷ', へ: 'ぺ', ほ: 'ぽ' };
// Readings KANJIDIC lacks but that are standard in context. Each needs a reason.
const extraReadings = {
  腔: ['くう'], // 慣用読み in medicine and dentistry: 口腔 こうくう, 腹腔 ふくくう (日本歯科医学会 用語)
  人: ['り'], // 二人 ふたり / 一人 ひとり written as {二|ふた}{人|り}
};
const charReadings = new Map();
function readingsOf(ch) {
  if (charReadings.has(ch)) return charReadings.get(ch);
  const k = kd.get(ch);
  const base = new Set([...(k?.on_readings || []), ...(k?.kun_readings || []), ...(k?.name_readings || []), ...(extraReadings[ch] || [])].map(hira).filter(Boolean));
  const out = new Set();
  for (const r of base) {
    const variants = [r];
    if (voiced[r[0]]) variants.push(voiced[r[0]] + r.slice(1));
    if (half[r[0]]) variants.push(half[r[0]] + r.slice(1));
    for (const v of variants) {
      out.add(v);
      if (v.length > 1 && /[つくちき]$/.test(v)) out.add(v.slice(0, -1) + 'っ');
      if (v === 'ぢ') out.add('じ');
      if (v === 'づ') out.add('ず');
    }
  }
  charReadings.set(ch, out);
  return out;
}
// Can `reading` be split into one reading per kanji (々 repeats the previous kanji)?
function composes(base, reading) {
  const chars = [...base];
  const memo = new Map();
  const go = (i, j) => {
    if (i === chars.length) return j === reading.length;
    const key = i * 1000 + j;
    if (memo.has(key)) return memo.get(key);
    const ch = chars[i] === '々' && i ? chars[i - 1] : chars[i];
    let ok = false;
    for (const r of readingsOf(ch)) if (reading.startsWith(r, j) && go(i + 1, j + r.length)) { ok = true; break; }
    memo.set(key, ok);
    return ok;
  };
  return go(0, 0);
}
const inJmdict = (base, reading) => {
  const first = [...base].find((c) => KANJI.test(c) && c !== '々');
  if (!first) return false;
  try { return kd.getWords(first).some((w) => w.variants.some((v) => v.written === base && v.pronounced === reading)); } catch { return false; }
};
const readingOk = (base, reading) => inJmdict(base, reading) || composes(base, reading);

const errors = [];
const mismatches = new Map(); // "漢字|given" -> { expected, keys }
let bare = 0;
const bareKeys = [];
for (const [key, text] of Object.entries(ja)) {
  const ruby = /\{([^{}|]+)\|([^{}|]+)\}/g;
  for (const m of text.matchAll(ruby)) {
    const [, base, given] = m;
    if (!KANJI.test(base)) errors.push(`${key}: {${base}|${given}} has no kanji on the left`);
    else if (!KANA.test(given)) errors.push(`${key}: {${base}|${given}} reading is not all kana`);
    else {
      if (!readingOk(base, toHira(given))) {
        const id = `${base}|${given}`;
        const e = mismatches.get(id) || { keys: [] };
        e.keys.push(key);
        mismatches.set(id, e);
      }
    }
  }
  const rest = text.replace(ruby, '');
  if (/[{}]/.test(rest.replace(/\{\{?\w+\}?\}/g, ''))) errors.push(`${key}: stray "{" or "}" (furigana markup is {漢字|かんじ})`);
  if (!exemptKey(key) && KANJI.test(rest)) { bare += 1; if (bareKeys.length < 40) bareKeys.push(`${key}: ${rest.match(/[㐀-䶿一-鿿々]+/g).join(' ')}`); }
}

console.log(`Furigana: ${Object.keys(ja).length} Japanese strings checked.`);
if (mismatches.size) {
  console.log(`\nReadings not found in JMdict/KANJIDIC (${mismatches.size}). Confirm with a fluent speaker:`);
  for (const [id, e] of [...mismatches].sort()) console.log(`  {${id}}  (${e.keys.slice(0, 3).join(', ')}${e.keys.length > 3 ? ', …' : ''})`);
}
if (bare) {
  console.log(`\nFor information: strings with kanji but no furigana (page titles and descriptions may be fine) (${bare})${bare > bareKeys.length ? `, first ${bareKeys.length}` : ''}:`);
  for (const b of bareKeys) console.log(`  ${b}`);
}
if (errors.length) {
  console.error(`\nBroken furigana markup (${errors.length}):`);
  for (const e of errors) console.error(`  ${e}`);
}
if (errors.length || (strict && mismatches.size)) process.exit(1);
console.log('\nFurigana markup OK.');
