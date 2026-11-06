#!/usr/bin/env node
// Free, scripted check of the project rules that need no judgement (no AI, no API cost).
// Rules: AGENTS.md (Disclaimer, Base meshes and model licences, collection rule) and
// project memory (justified paragraphs, neutral wording).
// Run: pnpm check:rules   Exit code 1 if any rule fails.
// Exceptions: tools/rules/allow.json (each needs a reason). Keep it short.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const read = (p) => readFileSync(join(root, p), 'utf8');
const errors = [];
const fail = (file, rule, msg) => errors.push({ file, rule, msg });
const allow = JSON.parse(read('tools/rules/allow.json'));
// An entry with "match" excuses only lines containing that text; without it, the whole file.
const allowed = (rule, file, line = '') => (allow[rule] || []).some((a) => a.file === file && (!a.match || line.includes(a.match)));

function walk(dir, test, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    const p = join(dir, name);
    const st = statSync(join(root, p));
    if (st.isDirectory()) {
      if (['pagefind', 'vendor', 'node_modules'].includes(name)) continue;
      walk(p, test, out);
    } else if (test(p)) out.push(p.split(sep).join('/'));
  }
  return out;
}
const norm = (s) => s.replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ');
const text = (html) => norm(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&'));

// --- Disclaimer wording (single source: app/disclaimer-text.ts)
const disc = read('app/disclaimer-text.ts');
const grab = (name) => {
  const m = disc.match(new RegExp(`export const ${name} =\\s*'([^']+)'`));
  if (!m) throw new Error(`Could not read ${name} from app/disclaimer-text.ts`);
  return norm(m[1]);
};
const modelDisclaimer = grab('modelDisclaimer');

// --- Collection: catalogue hrefs and dictionary items
const catalogueSrc = read('app/models/catalogue.ts');
const catalogue = [...catalogueSrc.matchAll(/\{\s*slug:\s*'([^']+)',\s*href:\s*'([^']+)',\s*image:\s*'([^']+)'/g)].map((m) => ({ slug: m[1], href: m[2], image: m[3] }));
const hrefs = new Set(catalogue.map((c) => c.href.replace(/\/?$/, '/')));
for (const dict of ['app/i18n/dictionaries/en.ts', 'app/i18n/dictionaries/ja.ts']) {
  const src = read(dict);
  for (const c of catalogue) {
    const key = /^[a-z]+$/.test(c.slug) ? `${c.slug}: {` : `'${c.slug}': {`;
    if (!src.includes(key)) fail(dict, 'collection', `no library item "${c.slug}" (catalogue.ts lists it)`);
  }
}
for (const c of catalogue) {
  if (!existsSync(join(root, 'public', c.image))) fail('app/models/catalogue.ts', 'collection', `render ${c.image} for "${c.slug}" is missing from public/`);
}

// --- Static pages under public/
const pages = walk('public', (p) => p.endsWith('index.html'));
for (const file of pages) {
  const html = read(file);
  const t = text(html);
  const route = '/' + relative('public', file).split(sep).join('/').replace(/index\.html$/, '');
  const hasModel = /\.glb\b|<model-viewer/i.test(html);

  if (!/href="\/disclaimer\/?"/.test(html)) fail(file, 'disclaimer', 'no link to /disclaimer');
  if (hasModel) {
    if (!t.includes(modelDisclaimer)) fail(file, 'disclaimer', 'model disclaimer missing or not word-for-word (copy it from app/disclaimer-text.ts)');
    if (!/clinically reviewed/i.test(t)) fail(file, 'review-status', 'no review status (e.g. "Not yet clinically reviewed.")');
    // A sub-view of a catalogued model (for example /stainless-steel-crown/kids/) counts if it links back to that model's page.
    const parent = [...hrefs].find((h) => h !== '/' && route !== h && route.startsWith(h));
    const linked = parent && html.includes(`href="${parent}"`);
    if (!hrefs.has(route) && !linked) fail(file, 'collection', `model page ${route} is not in app/models/catalogue.ts`);
  }
  if (/z-anatomy/i.test(t) && !/CC BY-SA/.test(t)) fail(file, 'licence', 'uses Z-Anatomy but does not say CC BY-SA 4.0');
}

// --- Justified paragraphs: no stylesheet may left-align plain <p> text
const css = walk('public', (p) => p.endsWith('.css')).concat(walk('app', (p) => p.endsWith('.css')));
for (const file of css) {
  const src = read(file).replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = m[1].split(',').map((s) => s.trim());
    if (!/text-align\s*:\s*(left|start)\b/.test(m[2])) continue;
    for (const sel of selectors) {
      if (/(^|[\s>+~])p$/.test(sel) && !allowed('justify', file)) fail(file, 'justify', `"${sel}" left-aligns paragraphs; paragraph text must be justified`);
    }
  }
}
// --- Note boxes: tinted box, not a coloured stripe down one side (Luke's decision D6, 6 Nov 2026).
// A thick solid left border with a colour is the stripe; 1px dividers and CSS triangles (transparent
// top/bottom borders) are fine.
for (const file of css) {
  if (file.includes('pagefind')) continue;
  const src = read(file).replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const stripe = m[2].match(/border-(?:left|inline-start)\s*:\s*([2-9]|\d{2,})px\s+solid/);
    if (stripe && !/border-top\s*:[^;]*transparent/.test(m[2]) && !allowed('note-stripe', file)) fail(file, 'note-stripe', `"${m[1].trim()}" has a coloured side stripe; use a tinted box (border all round + tinted background)`);
  }
}

for (const base of ['app/globals.css', 'public/site-header.css']) {
  if (!/(^|[\s,}])p\s*\{[^}]*text-align\s*:\s*justify/.test(read(base))) fail(base, 'justify', 'base rule "p { text-align: justify }" is missing');
}

// --- Neutral wording: no gendered pronouns in English site text
const pronoun = /\b(he|him|his|himself|she|her|hers|herself)\b/gi;
const englishSources = ['app/i18n/dictionaries/en.ts', ...pages];
for (const file of englishSources) {
  const lines = read(file).split('\n');
  lines.forEach((line, i) => {
    const plain = file.endsWith('.html') ? text(line) : line;
    const hits = plain.match(pronoun);
    if (hits && !allowed('neutral-wording', file, line)) fail(`${file}:${i + 1}`, 'neutral-wording', `gendered word(s): ${[...new Set(hits)].join(', ')}. Use "they/them" or "the" instead`);
  });
}

if (errors.length) {
  console.error(`Project rules: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  [${e.rule}] ${e.file}: ${e.msg}`);
  console.error('\nRules: AGENTS.md. Exceptions need a reason in tools/rules/allow.json.');
  process.exit(1);
}
console.log(`Project rules: all checks passed (${pages.length} static pages, ${css.length} stylesheets, ${catalogue.length} catalogue models).`);
