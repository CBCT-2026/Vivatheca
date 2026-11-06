// Writes schema.org JSON-LD into the <head> of every static model page (deep-dive pick X5).
// The data comes from app/models/jsonld.ts (catalogue, MeSH/UBERON codes, English titles, disclaimer),
// the same source the app pages use, between <!-- vt:jsonld --> and <!-- /vt:jsonld --> markers.
//
//   node tools/jsonld/build.mjs            write the blocks
//   node tools/jsonld/build.mjs --check    exit 1 if any page is out of date (CI)
//   node tools/jsonld/build.mjs --verify   check every MeSH and UBERON ID against NLM and EBI OLS (network)
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import '../patient-text/ts-resolve.mjs';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const mod = (p) => import(pathToFileURL(join(root, p)).href);
const { catalogue } = await mod('app/models/catalogue.ts');
const { modelJsonLd, serialise } = await mod('app/models/jsonld.ts');
const { modelCodes } = await mod('app/models/semantics.ts');
const args = process.argv.slice(2);

if (args.includes('--verify')) {
  const seen = new Map();
  for (const c of Object.values(modelCodes)) for (const x of [...c.subjects, ...c.anatomy]) seen.set(x.id, x.label);
  let bad = 0;
  for (const [id, label] of seen) {
    let got = '';
    if (id.startsWith('UBERON:')) {
      const iri = encodeURIComponent(encodeURIComponent(`http://purl.obolibrary.org/obo/${id.replace(':', '_')}`));
      const r = await fetch(`https://www.ebi.ac.uk/ols4/api/ontologies/uberon/terms/${iri}`);
      got = r.ok ? (await r.json()).label : `HTTP ${r.status}`;
    } else {
      const r = await fetch(`https://id.nlm.nih.gov/mesh/${id}.json`);
      const j = r.ok ? await r.json() : null;
      got = j ? (j.label?.['@value'] ?? j.label ?? '') : `HTTP ${r.status}`;
    }
    const ok = got === label;
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${id} ${label}${ok ? '' : ` (service says: ${got})`}`);
  }
  console.log(bad ? `${bad} code(s) do not match.` : `All ${seen.size} codes match.`);
  process.exit(bad ? 1 : 0);
}

// Every collection model needs its codes (app/models/semantics.ts).
const missing = catalogue.filter((m) => !modelCodes[m.slug]?.subjects.length || !modelCodes[m.slug]?.anatomy.length).map((m) => m.slug);
if (missing.length) { console.error(`No MeSH or UBERON codes in app/models/semantics.ts for: ${missing.join(', ')}`); process.exit(1); }

const START = '<!-- vt:jsonld -->';
const END = '<!-- /vt:jsonld -->';
let stale = 0;
for (const m of catalogue) {
  if (m.href.startsWith('/models/')) continue; // app pages render <JsonLd> themselves
  const file = join(root, 'public', m.href.replace(/^\/|\/$/g, ''), 'index.html');
  const html = await readFile(file, 'utf8');
  const block = `${START}\n<script type="application/ld+json">${serialise(modelJsonLd(m.slug))}</script>\n${END}`;
  const re = new RegExp(`${START}[\\s\\S]*?${END}`);
  const next = re.test(html) ? html.replace(re, block) : html.replace('</head>', `${block}\n</head>`);
  if (next === html) continue;
  stale++;
  if (args.includes('--check')) console.error(`Out of date: ${file.slice(root.length + 1)}`);
  else { await writeFile(file, next); console.log(`Wrote JSON-LD: ${file.slice(root.length + 1)}`); }
}
if (args.includes('--check') && stale) { console.error('Run: node tools/jsonld/build.mjs'); process.exit(1); }
if (!stale) console.log('JSON-LD up to date.');
