// Finds every DOI cited on the site and asks Unpaywall (https://unpaywall.org/products/api) for a
// legal free full-text copy: the publisher's free version, PubMed Central, or a university or
// institutional repository. Writes public/oa-links.json, which public/oa-links.js reads to add a
// "Free full text" link beside each DOI link. The DOI stays the citation.
//
// Unpaywall lists only legal copies (no ResearchGate uploads or pirate sites). Its API is free and
// asks for a contact email on each request. Run: node tools/citations/oa-links.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const EMAIL = 'vivatheca@gmail.com';
const ROOTS = ['app', 'public'];
const EXTS = new Set(['.ts', '.tsx', '.html', '.js', '.json']);
const SKIP = /(^|\/)(vendor|pagefind|node_modules)(\/|$)|oa-links\.json$/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (SKIP.test(p)) continue;
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXTS.has(extname(p)) && s.size < 5_000_000) out.push(p);
  }
  return out;
}

const dois = new Set();
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/https?:\/\/(?:dx\.)?doi\.org\/(10\.\d{4,9}\/[^\s"'<>)\]`]+)/gi)) {
      dois.add(decodeURIComponent(m[1]).replace(/[.,;:]+$/, '').toLowerCase());
    }
  }
}

const VERSION = { publishedVersion: 'published', acceptedVersion: 'accepted', submittedVersion: 'submitted' };
const out = {};
let checked = 0;
for (const doi of [...dois].sort()) {
  const url = `https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=${encodeURIComponent(EMAIL)}`;
  let data = null;
  for (let attempt = 0; attempt < 3 && !data; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) break;
      if (res.ok) data = await res.json();
    } catch { /* retry */ }
    if (!data) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  checked++;
  const loc = data?.best_oa_location;
  // Submitted (preprint, not peer reviewed) copies are left out: the citation is to the reviewed paper.
  if (!loc || !VERSION[loc.version] || loc.version === 'submittedVersion') continue;
  const link = loc.url_for_landing_page || loc.url_for_pdf || loc.url;
  if (!link || !/^https:\/\//.test(link)) continue;
  out[doi] = {
    url: link,
    version: VERSION[loc.version],
    host: loc.host_type === 'publisher' ? 'publisher' : 'repository',
    licence: loc.license || null,
  };
}

writeFileSync('public/oa-links.json', JSON.stringify({
  source: 'Unpaywall (https://unpaywall.org), checked ' + new Date().toISOString().slice(0, 10),
  links: out,
}, null, 1) + '\n');
console.log(`${checked} DOIs checked, ${Object.keys(out).length} with a legal free full text`);
