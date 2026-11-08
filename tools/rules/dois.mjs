#!/usr/bin/env node
// Free check of every DOI cited on the site, against Crossref (no AI, no API key).
//   pnpm check:dois            report; exit 1 if a DOI does not resolve or is retracted/withdrawn
// For each DOI it checks that:
//  1. Crossref knows it (else the DOI is probably mistyped or made up);
//  2. no retraction, withdrawal or expression of concern is linked to it (Crossref "updated-by",
//     which now includes Retraction Watch data); corrections are listed as warnings;
//  3. the citation on the site (within 4 lines of the DOI) names the first author's family name and the publication year
//     (warning only: some citations put the year on another line).
// Runs weekly in .github/workflows/links.yml; not on every PR, because Crossref can be slow.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const MAILTO = 'vivatheca@gmail.com'; // Crossref "polite pool": identifies the project, no key needed
const files = [];
(function walk(dir) {
  for (const name of readdirSync(join(root, dir))) {
    const p = join(dir, name);
    if (statSync(join(root, p)).isDirectory()) { if (!['vendor', 'pagefind', 'node_modules', 'videos', 'models'].includes(name)) walk(p); }
    else if (/\.(tsx?|html|js|md)$/.test(name)) files.push(p);
  }
})('app');
(function walk(dir) {
  for (const name of readdirSync(join(root, dir))) {
    const p = join(dir, name);
    if (statSync(join(root, p)).isDirectory()) { if (!['vendor', 'pagefind', 'videos', 'models', 'assets'].includes(name)) walk(p); }
    else if (/\.(html|js)$/.test(name)) files.push(p);
  }
})('public');

// Crossref records with known metadata errors, checked against PubMed. The site keeps the
// citation as published; this only stops the author/year warning. Add the evidence for each entry.
const METADATA_ERRORS = {
  // Crossref lists an extra first author "Spiotto"; PubMed 24422029 and the article list Juodzbalys G, Daugela P.
  '10.5037/jomr.2013.4201': { family: 'Juodzbalys' },
};
// HTML pages escape the < > in old SICI DOIs; turn them into the URL form the DOI pattern reads.
const unescape = (s) => s.replace(/&lt;/g, '%3C').replace(/&gt;/g, '%3E').replace(/&amp;/g, '&');

const cites = new Map(); // doi -> [{ file, line, text }]
for (const file of files) {
  const lines = unescape(readFileSync(join(root, file), 'utf8')).split('\n');
  lines.forEach((text, i) => {
    for (const m of text.matchAll(/10\.\d{4,9}\/(?:[^\s"'<>()\]`]|\([^\s"'<>()]*\))+/g)) {
      const doi = decodeURIComponent(m[0]).replace(/[.,;]+$/, '').toLowerCase();
      if (!cites.has(doi)) cites.set(doi, []);
      // Citation objects spread authors and year over nearby lines, so look 4 lines either side.
      cites.get(doi).push({ file, line: i + 1, text: lines.slice(Math.max(0, i - 4), i + 5).join(' ') });
    }
  });
}

const bad = [];
const warn = [];
const SERIOUS = /retraction|withdrawal|removal|expression.of.concern/i;
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
async function look(doi) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${MAILTO}`, { headers: { 'User-Agent': `Vivatheca DOI check (mailto:${MAILTO})` } });
      if (r.status === 404) return null;
      if (r.ok) return (await r.json()).message;
    } catch { /* retry */ }
    await new Promise((ok) => setTimeout(ok, 2000 * (attempt + 1)));
  }
  return undefined; // network trouble, not a bad DOI
}

const dois = [...cites.keys()].sort();
let unchecked = 0;
for (let i = 0; i < dois.length; i += 5) {
  await Promise.all(dois.slice(i, i + 5).map(async (doi) => {
    const where = cites.get(doi);
    const at = `${where[0].file}:${where[0].line}${where.length > 1 ? ` (+${where.length - 1} more)` : ''}`;
    const m = await look(doi);
    if (m === undefined) { unchecked++; return; }
    if (m === null) {
      // DataCite DOIs (datasets, Zenodo) are not in Crossref: try doi.org before failing.
      const r = await fetch(`https://doi.org/api/handles/${doi}`).then((x) => x.json()).catch(() => null);
      if (r?.responseCode === 1) return;
      bad.push(`${doi}: not found in Crossref or doi.org (mistyped?) — ${at}`);
      return;
    }
    const near = fold(where.map((w) => w.text).join(' '));
    for (const u of m['updated-by'] || []) {
      // A correction cited beside the original (on any page citing it) is acknowledged: no warning.
      if (!SERIOUS.test(u.type || '') && u.DOI && near.includes(fold(u.DOI))) continue;
      const line = `${doi}: ${u.type || 'update'} ${u.DOI ? `(${u.DOI})` : ''} — ${at}`;
      if (SERIOUS.test(u.type || '')) bad.push(line); else warn.push(line);
    }
    const years = [...new Set(['issued', 'published', 'published-print', 'published-online'].map((k) => m[k]?.['date-parts']?.[0]?.[0]).filter(Boolean).map(String))];
    const family = METADATA_ERRORS[doi]?.family || m.author?.find((a) => a.sequence === 'first')?.family || m.author?.[0]?.family;
    const missing = [];
    if (family && !near.includes(fold(family))) missing.push(`first author ${family}`);
    if (years.length && !years.some((y) => near.includes(y))) missing.push(`year ${years.join('/')}`);
    if (missing.length) warn.push(`${doi}: citation near the DOI does not mention ${missing.join(' or ')} — ${at}`);
  }));
}

const report = [
  `# DOI check`,
  '',
  `${dois.length} DOIs checked against Crossref${unchecked ? ` (${unchecked} could not be reached)` : ''}.`,
  '',
  ...(bad.length ? ['## Must fix (not found, retracted, withdrawn or under concern)', '', ...bad.map((b) => `- ${b}`), ''] : []),
  ...(warn.length ? ['## Check (corrections, or citation text that may not match)', '', ...warn.map((w) => `- ${w}`), ''] : []),
].join('\n');
console.log(report);
if (process.argv.includes('--out')) writeFileSync(process.argv[process.argv.indexOf('--out') + 1], report);
if (bad.length) process.exit(1);
