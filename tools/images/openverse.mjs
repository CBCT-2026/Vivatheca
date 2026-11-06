// Find openly licensed images through the Openverse API (WordPress/openverse, MIT; the API is free,
// no key needed for light use) and draft entries for the image register, applying the rules in
// docs/image-licensing.md: only CC BY, CC BY-SA, CC0 and public-domain marks are proposed for use;
// NC and ND results are shown but flagged as display-only or not usable.
//
//   node tools/images/openverse.mjs "mandible radiograph"                 search (20 results)
//   node tools/images/openverse.mjs "oroantral fistula" --all             include NC / ND results
//   node tools/images/openverse.mjs "mandible radiograph" --source wikimedia,flickr --size 40
//   node tools/images/openverse.mjs "oroantral fistula radiograph" --pmc   CC BY journal articles (Europe PMC)
//   node tools/images/openverse.mjs --draft <openverse id> --for head-neck/scc --name opg-before.jpg
//       writes a draft entry to docs/image-register.json (status "draft": needs the second check)
//
// The tool never downloads an image: every result still needs the case-by-case check in the
// policy (rights holder really applied the licence, no identifiable patient, consent documented).
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const REGISTER = resolve(root, 'docs/image-register.json');
const API = 'https://api.openverse.org/v1/images/';
const UA = 'vivatheca-image-tools/0.1 (https://vivatheca.com)';
const USABLE = new Set(['by', 'by-sa', 'cc0', 'pdm']); // policy section 2
const DISPLAY_ONLY = new Set(['by-nc', 'by-nc-sa']); // page display only, never downloads or /create
const UNCHANGED_ONLY = new Set(['by-nd', 'by-nc-nd']);

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : undefined; };
const query = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--'))).join(' ');

function verdict(licence) {
  const l = licence.toLowerCase();
  if (USABLE.has(l)) return 'USE: attribution (and share-alike for BY-SA)';
  if (DISPLAY_ONLY.has(l)) return 'DISPLAY ONLY: not in downloads, print files or /create';
  if (UNCHANGED_ONLY.has(l)) return 'UNCHANGED ONLY: no crop, labels or colour change' + (l.includes('nc') ? '; also display only' : '');
  return 'NO: licence not in the policy';
}

async function search() {
  const params = new URLSearchParams({ q: query, page_size: opt('--size') || '20' });
  if (!args.includes('--all')) params.set('license', 'by,by-sa,cc0,pdm');
  if (opt('--source')) params.set('source', opt('--source'));
  params.set('mature', 'false');
  const res = await fetch(`${API}?${params}`, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Openverse ${res.status}: ${await res.text()}`);
  const data = await res.json();
  console.log(`${data.result_count} results for "${query}" (${args.includes('--all') ? 'all licences' : 'CC BY, BY-SA, CC0, PDM only'})\n`);
  for (const r of data.results) {
    const licence = `${r.license.toUpperCase()}${r.license_version ? ' ' + r.license_version : ''}`;
    console.log(`${r.id}\n  ${r.title || '(untitled)'} — ${r.creator || 'unknown creator'} · ${r.source}${r.width ? ` · ${r.width}×${r.height}` : ''}`);
    console.log(`  ${licence} → ${verdict(r.license)}`);
    console.log(`  page: ${r.foreign_landing_url}`);
    if (r.unstable__sensitivity?.length) console.log(`  sensitivity flags: ${r.unstable__sensitivity.join(', ')}`);
    console.log();
  }
  console.log('Before using any image: open its source page and apply docs/image-licensing.md section 1 (licence stated on the file page, uploader owns the rights, no identifiable patient, consent documented). Journal figures: prefer PubMed Central CC BY articles, which Openverse does not index.');
}

async function draft(id) {
  const res = await fetch(`${API}${id}/`, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const r = await res.json();
  const register = JSON.parse(await readFile(REGISTER, 'utf8').catch(() => '{"images":[]}'));
  const entry = {
    status: 'draft',
    file: `public/images/clinical/${opt('--for') || 'TODO'}/${opt('--name') || 'TODO.jpg'}`,
    title: r.title || '',
    creator: r.creator || '',
    creatorUrl: r.creator_url || '',
    source: r.source,
    sourcePage: r.foreign_landing_url,
    imageUrl: r.url,
    licence: `${r.license.toUpperCase()}${r.license_version ? ' ' + r.license_version : ''}`,
    licenceUrl: r.license_url,
    attribution: r.attribution || '',
    policyVerdict: verdict(r.license),
    changes: 'none',
    patientIdentifiable: 'TODO: check (faces, burned-in names, dates, record numbers)',
    consent: 'TODO: what the source says about consent',
    rightsHolderCheck: 'TODO: confirm the uploader is the author or names a verifiable source',
    foundVia: 'Openverse ' + r.detail_url,
    added: new Date().toISOString().slice(0, 10),
    secondCheck: null,
  };
  register.images.push(entry);
  await writeFile(REGISTER, JSON.stringify(register, null, 2) + '\n');
  console.log(`Draft entry added to docs/image-register.json:\n${JSON.stringify(entry, null, 2)}\nFill in the TODO fields and get the second check before the image goes on a page.`);
}

// Journal figures: Europe PMC lists open-access articles with a CC BY licence (policy section 7, first choice).
async function pmc() {
  const q = `(${query}) AND LICENSE:"cc by" AND OPEN_ACCESS:Y`;
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q)}&format=json&pageSize=${opt('--size') || '15'}&resultType=lite`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Europe PMC ${res.status}`);
  const data = await res.json();
  console.log(`${data.hitCount} CC BY open-access articles for "${query}" (Europe PMC)\n`);
  for (const r of data.resultList.result) {
    console.log(`${r.pmcid || r.id}  ${r.title}\n  ${r.authorString || ''} ${r.journalTitle || ''} ${r.pubYear || ''}${r.doi ? ` · https://doi.org/${r.doi}` : ''}\n`);
  }
  console.log('Open each article, check the figure has no "reproduced from" credit line, and record it with the article licence.');
}

if (opt('--draft')) await draft(opt('--draft'));
else if (args.includes('--pmc') && query) await pmc();
else if (query) await search();
else { console.error('Usage: node tools/images/openverse.mjs "<query>" [--all] [--source wikimedia] [--size 20] | --draft <id> --for <folder> --name <file>'); process.exit(2); }
