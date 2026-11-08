// Builds the site search index (Pagefind, MIT) into public/pagefind/.
//
// Every page is rendered in Chromium once in English and once in Japanese (cookie vivatheca-lang=ja),
// because the static model pages swap their text in at run time. The rendered HTML goes to a temp
// folder as <lang>/<path>/index.html with <html lang>, so Pagefind builds one index per language;
// the search page (app/search) picks the index for the visitor's language and rewrites result links.
//
// Usage: pnpm build && pnpm start &   then   node tools/search/build-index.mjs
//   BASE=http://127.0.0.1:3000 (default). If nothing answers there, `pnpm start` is run for the duration.
// The output is committed, so a deploy never needs a browser. CI checks that it is up to date.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const OUT = join(root, 'public', 'pagefind');
const LANGS = ['en', 'ja'];
const SKIP = new Set(['/search', '/api', '/report', '/collection', '/show']); // the search page, the API, the error form, the /models alias, and the show-a-patient picker (same models as /models)

async function appRoutes() {
  const routes = [];
  const walk = async (dir, url) => {
    for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isDirectory()) await walk(join(dir, entry.name), `${url}/${entry.name}`);
      else if (entry.name === 'page.tsx') routes.push(url || '/');
    }
  };
  await walk(join(root, 'app'), '');
  return routes.filter((r) => ![...SKIP].some((s) => r === s || r.startsWith(s + '/')));
}

async function staticPages() {
  const pub = join(root, 'public');
  const pages = [];
  const isPage = async (dir) => { try { return (await stat(join(pub, dir, 'index.html'))).isFile(); } catch { return false; } };
  for (const name of (await readdir(pub)).sort()) {
    if (['vendor', 'pagefind'].includes(name)) continue;
    if (await isPage(name)) pages.push(`/${name}/`);
    let subs = [];
    try { if ((await stat(join(pub, name))).isDirectory()) subs = (await readdir(join(pub, name))).sort(); } catch { /* file */ }
    for (const sub of subs) if (await isPage(`${name}/${sub}`)) pages.push(`/${name}/${sub}/`);
  }
  return pages;
}

async function reachable() { try { return (await fetch(BASE, { redirect: 'manual' })).status < 500; } catch { return false; } }

let server = null;
if (!(await reachable())) {
  server = spawn('pnpm', ['start'], { cwd: root, stdio: 'ignore' });
  for (let i = 0; i < 60 && !(await reachable()); i++) await new Promise((r) => setTimeout(r, 1000));
  if (!(await reachable())) { console.error(`No server at ${BASE}`); process.exit(1); }
}

const tmp = await mkdtemp(join(tmpdir(), 'vivatheca-search-'));
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const pages = [...(await appRoutes()), ...(await staticPages())];
const manifest = {}; // url -> { en: sha1 of the indexed text, ja: ... }; CI compares this file to catch a stale index
try {
  for (const lang of LANGS) {
    const context = await browser.newContext({ locale: lang === 'ja' ? 'ja-JP' : 'en-AU' });
    await context.addCookies([{ name: 'vivatheca-lang', value: lang, url: BASE }, { name: 'vivatheca-furigana', value: 'off', url: BASE }]);
    const page = await context.newPage();
    for (const url of pages) {
      // Static pages are fetched as /name/index.html (the local server has no directory index) but indexed as /name/.
      await page.goto(BASE + (url.endsWith('/') && url !== '/' ? url + 'index.html' : url), { waitUntil: 'load' });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {}); // pages that keep polling never go idle
      const { html, text } = await page.evaluate((lang) => {
        document.querySelectorAll('script, style, noscript, header, footer, nav, model-viewer, canvas, dialog, [aria-hidden="true"], [aria-live], [role="status"], .skip-link, .cite, sup.cite').forEach((el) => el.remove());
        // Static pages carry every language inline and hide the others: drop hidden text in other languages,
        // and give each heading only its rendered text, so result titles are in one language.
        document.querySelectorAll('[lang]').forEach((el) => { if (!el.lang.startsWith(lang) && el !== document.documentElement && !el.getClientRects().length) el.remove(); });
        document.querySelectorAll('main h1, main h2, main h3').forEach((h) => { if (h.getClientRects().length) h.textContent = h.innerText.replace(/\s+/g, ' ').trim(); });
        document.documentElement.lang = lang;
        const main = document.querySelector('main') || document.body;
        return { html: '<!doctype html>' + document.documentElement.outerHTML, text: main.textContent.replace(/\s+/g, ' ').trim() };
      }, lang);
      (manifest[url] ||= {})[lang] = createHash('sha1').update(text).digest('hex').slice(0, 12);
      const dir = join(tmp, lang, url);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'index.html'), html);
      console.log(`${lang} ${url}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
  if (server) server.kill();
}

await rm(OUT, { recursive: true, force: true });
const pagefind = spawn('pnpm', ['exec', 'pagefind', '--site', tmp, '--output-path', OUT, '--root-selector', 'main', '--verbose'], { cwd: root, stdio: 'inherit' });
await new Promise((ok, fail) => pagefind.on('exit', (code) => (code ? fail(new Error(`pagefind exited ${code}`)) : ok())));
await rm(tmp, { recursive: true, force: true });
await writeFile(join(OUT, 'vivatheca-pages.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log(`Indexed ${pages.length} pages x ${LANGS.length} languages into public/pagefind/`);
