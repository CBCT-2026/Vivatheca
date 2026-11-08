#!/usr/bin/env node
// Builds public/sitemap.xml from the app routes (app/**/page.tsx) and the static model pages
// (public/**/index.html). Free, no network.
//   pnpm sitemap           write public/sitemap.xml
//   pnpm sitemap --check   exit 1 if public/sitemap.xml is out of date (run in CI)
// Pages that are not meant for search (admin, search results, aliases) are left out.
// While the site is password-gated, public/robots.txt disallows crawling; the sitemap is ready for launch.
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const ORIGIN = 'https://vivatheca.com';
const SKIP = new Set(['/admin', '/collection', '/search', '/create', '/show', '/print']);

const routes = new Set();
(function walk(dir) {
  for (const name of readdirSync(join(root, dir))) {
    const p = join(dir, name);
    if (statSync(join(root, p)).isDirectory()) { if (!name.startsWith('[') && !name.startsWith('(') && !name.startsWith('_') && name !== 'api') walk(p); }
    else if (name === 'page.tsx') routes.add(p.replace(/^app/, '').replace(/\/page\.tsx$/, '') || '/');
  }
})('app');
(function walk(dir) {
  for (const name of readdirSync(join(root, dir))) {
    const p = join(dir, name);
    if (statSync(join(root, p)).isDirectory()) { if (!['vendor', 'pagefind', 'models', 'assets', 'videos', 'templates', 'print'].includes(name)) walk(p); }
    else if (name === 'index.html') {
      const html = readFileSync(join(root, p), 'utf8');
      if (/http-equiv=["']refresh/i.test(html)) continue; // redirect stubs
      routes.add(p.replace(/^public/, '').replace(/index\.html$/, ''));
    }
  }
})('public');

const urls = [...routes].filter((r) => !SKIP.has(r)).sort();
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) => `  <url><loc>${ORIGIN}${u}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

const out = join(root, 'public/sitemap.xml');
if (process.argv.includes('--check')) {
  const now = existsSync(out) ? readFileSync(out, 'utf8') : '';
  if (now !== xml) { console.error('public/sitemap.xml is out of date: run `pnpm sitemap` and commit it.'); process.exit(1); }
  console.log(`sitemap.xml up to date (${urls.length} pages).`);
} else {
  writeFileSync(out, xml);
  console.log(`Wrote public/sitemap.xml (${urls.length} pages).`);
}
