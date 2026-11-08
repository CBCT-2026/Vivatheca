#!/usr/bin/env node
// Justified-Paragraph Rule check (DESIGN.md). Free, runs in Chromium, no network.
//
// Opens every page in public/sitemap.xml plus the unlisted app routes, in English, Japanese and
// Vietnamese, at desktop and phone width, in light and dark theme, and fails if any block of running
// text (two or more lines of words) is not justified. Headings, buttons, form controls, navigation,
// tables, code and deliberately centred text are not running text and are skipped.
//
// Usage: pnpm build && pnpm start   (in another shell)  then  pnpm check:justify
//   BASE=http://127.0.0.1:3000 (default)   ONLY=/models,/about (optional route filter)
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = (process.env.BASE || 'http://127.0.0.1:3000').replace(/\/$/, '');
const sitemap = readFileSync(new URL('../../public/sitemap.xml', import.meta.url), 'utf8');
const listed = [...sitemap.matchAll(/<loc>https:\/\/vivatheca\.com([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
// Routes the sitemap leaves out on purpose but visitors still see.
const extra = ['/collection', '/search', '/create', '/show', '/print', '/models?discipline=oral-and-maxillofacial-surgery'];
let routes = [...new Set([...listed, ...extra])];
if (process.env.ONLY) routes = routes.filter((r) => process.env.ONLY.split(',').includes(r));

const LANGS = ['en', 'ja', 'vi'];
const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 900 }, isMobile: false },
  { name: 'phone', viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 3, hasTouch: true },
];
const THEMES = ['light', 'dark'];

// Runs in the page. Returns every multi-line running-text block whose text-align is not justify.
function audit() {
  const SKIP = 'h1,h2,h3,h4,h5,h6,summary,legend,a.button,.quick-tile,button,[role="button"],[role="tab"],[role="menuitem"],label,input,select,textarea,option,nav,header nav,th,td,caption,pre,code,kbd,svg,model-viewer,canvas,[data-justify-skip],.vt-label-layer,.hotspot-label,pagefind-modal,pagefind-results';
  const INLINE = new Set(['inline', 'inline-block', 'contents', 'none']);
  const bad = [];
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (INLINE.has(cs.display) || cs.display.startsWith('table') || cs.visibility === 'hidden') continue;
    if (el.closest(SKIP)) continue;
    // A text block: its own text (direct text nodes plus inline children), with no block children.
    let hasText = false;
    let blockChild = false;
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim()) hasText = true;
      else if (n.nodeType === 1) {
        const d = getComputedStyle(n).display;
        if (!INLINE.has(d)) { blockChild = true; break; }
        if (n.textContent.trim()) hasText = true;
      }
    }
    if (!hasText || blockChild) continue;
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    if (text.length < 30) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height === 0) continue;
    // Count rendered lines from the text's own boxes.
    const range = document.createRange();
    range.selectNodeContents(el);
    const tops = [];
    for (const box of range.getClientRects()) if (box.width > 1 && box.height > 1) tops.push(box.top);
    tops.sort((a, b) => a - b);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3;
    let lines = tops.length ? 1 : 0;
    for (let i = 1; i < tops.length; i++) if (tops[i] - tops[i - 1] > lh * 0.6) lines++;
    if (lines < 2) continue;
    const align = cs.textAlign;
    if (align === 'justify' || align === 'center') continue;
    const path = [];
    for (let e = el; e && e !== document.body && path.length < 4; e = e.parentElement) {
      path.unshift(e.tagName.toLowerCase() + (e.id ? `#${e.id}` : '') + (e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : ''));
    }
    bad.push({ where: path.join(' > '), align, text: text.slice(0, 70) });
  }
  // One entry per selector, so a list of 40 identical items is reported once.
  const seen = new Map();
  for (const b of bad) if (!seen.has(b.where)) seen.set(b.where, b);
  return [...seen.values()];
}

const auth = process.env.SITE_PASSWORD ? { username: 'vivatheca', password: process.env.SITE_PASSWORD } : undefined;
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const failures = [];
let checked = 0;
const combos = VIEWPORTS.flatMap((vp) => THEMES.flatMap((theme) => LANGS.map((lang) => ({ vp, theme, lang }))));
async function run({ vp, theme, lang }) {
  const context = await browser.newContext({ ...vp, colorScheme: theme, httpCredentials: auth });
  await context.addCookies([{ name: 'vivatheca-lang', value: lang, url: BASE }]);
  await context.addInitScript((t) => { try { localStorage.setItem('vivatheca-theme', t); } catch { /* storage blocked */ } }, theme);
  const page = await context.newPage();
  // A missing stylesheet would make every page look unstyled (and every paragraph start-aligned).
  page.on('response', (r) => { if (r.request().resourceType() === 'stylesheet' && r.status() >= 400) failures.push(`stylesheet ${r.url()}: HTTP ${r.status()}`); });
  for (const route of routes) {
    const tag = `${route} [${lang} ${vp.name} ${theme}]`;
    try {
      // Static model pages are served as /<name>/index.html locally (the Worker adds the trailing-slash route).
      const res = await page.goto(BASE + (route !== '/' && route.endsWith('/') ? route + 'index.html' : route), { waitUntil: 'load', timeout: 45_000 });
      if (!res || res.status() >= 400) { failures.push(`${tag}: HTTP ${res?.status()}`); continue; }
      await page.waitForTimeout(400); // static-i18n.js and client components swap text after load
      for (const b of await page.evaluate(audit)) failures.push(`${tag} ${b.where} (text-align: ${b.align}): "${b.text}"`);
      checked++;
    } catch (e) {
      failures.push(`${tag}: ${e.message.split('\n')[0]}`);
    }
  }
  await context.close();
}
const queue = [...combos];
await Promise.all(Array.from({ length: Number(process.env.WORKERS || 4) }, async () => { while (queue.length) await run(queue.shift()); }));
await browser.close();

if (failures.length) {
  console.error(`Justified-Paragraph Rule: ${failures.length} problem(s) on ${checked} page views.\n` + failures.map((f) => '  ' + f).join('\n'));
  console.error('\nRunning text must be justified (DESIGN.md). Fix the CSS, or mark a deliberate exception with data-justify-skip.');
  process.exit(1);
}
console.log(`Justified-Paragraph Rule: all running text justified on ${checked} page views (${routes.length} routes × ${LANGS.length} languages × ${VIEWPORTS.length} widths × ${THEMES.length} themes).`);
