// Writes the patient-facing text of every Vivatheca page, as a visitor sees it, to .pitk/
// so the patient-education-toolkit checker (pitk) can check it. See tools/patient-text/README.md.
//
// - Static model pages (public/*/index.html): rendered in Chromium once in English and once in
//   Japanese (cookie vivatheca-lang=ja). Only visible text is kept, and the caption of every
//   stage or age button is added, because viewer.js writes those captions at runtime.
// - App routes: the plain-language stage text of the homepage bone graft model and the homepage
//   clinical image heading, note and captions, from app/i18n/dictionaries.
//
// Usage: node tools/patient-text/snapshot.mjs   (then: pitk check)

import { createServer } from 'node:http';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import './ts-resolve.mjs';
import { chromium } from '@playwright/test';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const pub = join(root, 'public');
const out = join(root, '.pitk');
const LANGS = ['en', 'ja'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.wasm': 'application/wasm' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const doc = (lang, title, body) => `<!doctype html>\n<html lang="${lang}"><head><meta charset="utf-8"><title>${esc(title)}</title></head>\n<body><main>\n${body}\n</main></body></html>\n`;

function serve() {
  const server = createServer(async (req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (path.endsWith('/')) path += 'index.html';
    const file = join(pub, path);
    if (!file.startsWith(pub) || /\.(glb|zip|stl|png|jpe?g|webp)$/i.test(file)) return res.writeHead(404).end();
    let body;
    try {
      body = await readFile(file);
    } catch {
      return res.writeHead(404).end();
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(body);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

// Static pages: public/<name>/index.html, plus two levels of sub-pages (public/<name>/<sub>/index.html and
// public/<name>/<sub>/<sub2>/index.html, e.g. /models/impacted-wisdom-tooth/options/).
async function staticPages() {
  const pages = [];
  const isPage = async (dir) => {
    try {
      return (await stat(join(pub, dir, 'index.html'))).isFile();
    } catch {
      return false;
    }
  };
  for (const name of (await readdir(pub)).sort()) {
    if (await isPage(name)) pages.push(name);
    let subs = [];
    try {
      if ((await stat(join(pub, name))).isDirectory()) subs = (await readdir(join(pub, name))).sort();
    } catch { /* not a folder */ }
    for (const sub of subs) {
      if (await isPage(`${name}/${sub}`)) pages.push(`${name}/${sub}`);
      let subs2 = [];
      try {
        if ((await stat(join(pub, name, sub))).isDirectory()) subs2 = (await readdir(join(pub, name, sub))).sort();
      } catch { /* not a folder */ }
      for (const sub2 of subs2) if (await isPage(`${name}/${sub}/${sub2}`)) pages.push(`${name}/${sub}/${sub2}`);
    }
  }
  return pages;
}

// Runs in the page: visible main text, then every stage caption.
function capture() {
  const main = document.querySelector('main') || document.body;
  // Step captions of side-by-side option viewers (.option .step, e.g. /models/impacted-wisdom-tooth/options/) are
  // all patient text, though only the current step shows.
  main.querySelectorAll('.option .step[hidden]').forEach((el) => { el.hidden = false; });
  for (const el of main.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') el.setAttribute('data-pitk-hidden', '');
  }
  const copy = main.cloneNode(true);
  // .vt-create and .vt-guide (public/model-page.js) link clinicians to /create and students to /learn; not patient text.
  // .vt-share (public/share-tools.js) is the clinicians' "Use this model" toolbox (links, credit, embed); not patient text.
  copy.querySelectorAll('[data-pitk-hidden], script, style, model-viewer, button, [role="group"], #stage, nav, .vt-label-sources, .vt-label-layer, .vt-callouts, .vt-create, .vt-guide, .vt-share, .vt-tourbar, .vt-embedbar').forEach((el) => el.remove());
  return copy.innerHTML;
}

async function snapshotStatic(browser, base, page, lang) {
  const context = await browser.newContext();
  await context.addCookies([{ name: 'vivatheca-lang', value: lang, url: base }]);
  const tab = await context.newPage();
  await tab.goto(`${base}/${page}/`, { waitUntil: 'domcontentloaded' });
  await tab.waitForTimeout(300);
  const title = await tab.title();
  // A page with no translation stays in English: skip its Japanese copy.
  if ((await tab.evaluate(() => document.documentElement.lang)) !== lang) {
    await context.close();
    return null;
  }
  // Click through every combination of the caption buttons (stage, age, bite class, before/after).
  const captions = [];
  const groups = [];
  // Captions are read from #stage. A page without one (head-neck) has nothing to collect, and
  // reading a missing #stage waits for Playwright's 30 s timeout at every combination.
  const hasStage = (await tab.locator('#stage').count()) > 0;
  for (const attr of ['data-stage', 'data-age', 'data-class', 'data-phase', 'data-case']) {
    if (hasStage && (await tab.locator(`[${attr}]`).count()) > 0) groups.push(tab.locator(`button[${attr}]`));
  }
  const walk = async (level) => {
    if (level === groups.length) {
      const html = hasStage ? await tab.locator('#stage').innerHTML() : '';
      if (html.trim() && !captions.includes(html)) captions.push(html);
      return;
    }
    const buttons = groups[level];
    let clicked = false;
    for (let i = 0; i < (await buttons.count()); i += 1) {
      // Skip hidden and disabled buttons: Playwright would wait on a disabled one until its
      // timeout (head-neck disables "Closing the gap" for cases without a reconstruction).
      if (!(await buttons.nth(i).isVisible()) || !(await buttons.nth(i).isEnabled())) continue;
      await buttons.nth(i).click({ timeout: 5000 });
      clicked = true;
      await walk(level + 1);
    }
    if (!clicked) await walk(level + 1);
  };
  await walk(0);
  const body = await tab.evaluate(capture);
  await context.close();
  const stages = captions.map((c) => `<section class="pitk-stage">${c}</section>`).join('\n');
  return doc(lang, title, `${body}\n${stages}`);
}

// {漢字|かんじ} furigana markup -> ruby, as app/i18n/ruby.tsx renders it.
const ruby = (s) => esc(s).replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');

async function appText() {
  const files = {};
  for (const lang of LANGS) {
    const url = pathToFileURL(join(root, 'app/i18n/dictionaries', `${lang}.ts`)).href;
    const d = (await import(url)).default;
    const steps = d.abg.stages.map((s) => `<h2>${ruby(s.title)}</h2>\n<p>${ruby(s.text)}</p>`).join('\n');
    files[`app-bone-graft-stages.${lang}.html`] = doc(lang, 'Alveolar bone graft model stages (homepage, plain language)', steps);
    // Homepage clinical image section: patient-facing heading, note and captions.
    const c = d.clinical;
    const captions = Object.values(c.images).map((img) => `<p>${ruby(img.caption)}</p>`).join('\n');
    files[`app-wisdom-tooth-images.${lang}.html`] = doc(lang, 'Wisdom tooth X-rays and scans (homepage)', `<h2>${ruby(c.heading)}</h2>\n<p>${ruby(c.note)}</p>\n${captions}`);
    // Visit pack take-home text (/visit-pack, app/visit-pack/page.tsx): what the patient takes home.
    for (const [slug, mt] of Object.entries(d.visitPack.models)) {
      const cite = (t) => ruby(t).replace(/\[(\d+)\]/g, '<sup class="cite">$1</sup>');
      files[`app-visit-pack-${slug}.${lang}.html`] = doc(lang, `Visit pack: ${slug}`,
        `<h2>${ruby(d.visitPack.picturesHeading)}</h2>\n<h2>${ruby(mt.heading)}</h2>\n${mt.text.map((t) => `<p>${cite(t)}</p>`).join('\n')}\n<p>${ruby(mt.note)}</p>\n` +
        `<h3>${ruby(mt.questionsHeading)}</h3>\n<ul>${mt.questions.map((q) => `<li>${ruby(q)}</li>`).join('')}</ul>\n<p>${cite(mt.questionsSource)}</p>\n` +
        `<h3>${ruby(d.visitPack.qrHeading)}</h3>\n<p>${ruby(d.visitPack.qrText)}</p>`);
    }
    // Narrated videos on the app model pages (app/video-section.tsx). Static pages show theirs through
    // public/video-embed.js, so the static snapshots above already hold those words.
    const { videos } = await import(pathToFileURL(join(root, 'app/videos.ts')).href);
    for (const slug of ['impacted-wisdom-tooth', 'alveolar-bone-graft']) {
      const v = videos[slug][lang];
      files[`app-video-${slug}.${lang}.html`] = doc(lang, `Video: ${v.title}`,
        `<h2>${ruby(d.video.says)}</h2>\n<p>${v.lines.map((l) => ruby(l.text)).join(' ')}</p>`);
    }
  }
  return files;
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const files = await appText();
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
try {
  for (const page of await staticPages()) {
    for (const lang of LANGS) {
      const t0 = Date.now();
      const html = await snapshotStatic(browser, base, page, lang);
      console.log(`${page} ${lang}: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      if (html) files[`${page.replaceAll('/', '-')}.${lang}.html`] = html;
      else console.log(`${page}: no ${lang} version`);
    }
  }
} finally {
  await browser.close();
  server.close();
}
for (const [name, html] of Object.entries(files)) await writeFile(join(out, name), html);
console.log(`Wrote ${Object.keys(files).length} files to .pitk/`);
