import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { languageButton } from './language';

// Finds every page automatically, so new pages are checked without editing this file:
// app routes (app/**/page.tsx, skipping dynamic and redirect-only routes) and static pages (public/*/index.html).
function appRoutes(dir = 'app', base = ''): string[] {
  const routes: string[] = [];
  if (existsSync(join(dir, 'page.tsx'))) routes.push(base || '/');
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('[') || entry.name.startsWith('_') || entry.name === 'api') continue;
    routes.push(...appRoutes(join(dir, entry.name), `${base}/${entry.name}`));
  }
  return routes;
}
const redirects = new Set(['/collection']);
const appPages = appRoutes().filter((route) => route !== '/' && !redirects.has(route));
// Includes nested pages such as public/head-neck/scc/index.html.
function staticRoutes(dir = 'public', base = ''): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    // The local server needs index.html spelled out; production serves /<name>/.
    if (existsSync(join(path, 'index.html'))) routes.push(`${base}/${entry.name}/index.html`);
    routes.push(...staticRoutes(path, `${base}/${entry.name}`));
  }
  return routes;
}
const staticPages = staticRoutes();

test('every page has a logo in its header that links to the homepage', async ({ page }) => {
  test.setTimeout(180_000); // visits every page, including the static model pages
  expect(appPages.length).toBeGreaterThan(5);
  expect(staticPages.length).toBeGreaterThan(5);
  for (const path of [...appPages, ...staticPages]) {
    await page.goto(path);
    const logo = page.locator('header').first().locator('a[href="/"]').filter({ has: page.locator('img[alt="Vivatheca"]') });
    await expect(logo, `${path} needs a Vivatheca logo linking to /`).toHaveCount(1);
    await logo.click();
    await expect(page, `logo on ${path} should open the homepage`).toHaveURL(/\/$/);
    await expect(page.locator('.hero')).toBeVisible();
  }
});

test('homepage buttons for the model collection open /models', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const links = page.locator('main a[href="/models"]');
  const count = await links.count();
  expect(count).toBeGreaterThan(2);
  for (let i = 0; i < count; i += 1) {
    await page.goto('/');
    await page.locator('main a[href="/models"]').nth(i).click();
    await expect(page).toHaveURL(/\/models$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Model collection' }).click();
  await expect(page).toHaveURL(/\/models$/);
});

test('inner pages share the same top bar order as the homepage', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/about');
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(nav.getByRole('link')).toHaveText(['How it works', 'Model collection', 'Evidence', 'Create', 'Students', 'About']);
  await nav.getByRole('link', { name: 'How it works' }).click();
  await expect(page).toHaveURL(/\/#how-it-works$/);
});

test('unknown addresses show a branded 404 page with a way home', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('We could not find that page.');
  await expect(page.locator('header').first().locator('a[href="/"]').filter({ has: page.locator('img[alt="Vivatheca"]') })).toHaveCount(1);
  await expect(page.locator('main a[href="/models"]')).toBeVisible();
  await expect(page.locator('footer a[href="/disclaimer"]').first()).toBeVisible();
});

test('phones get the same menu button on inner pages and static model pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  for (const path of ['/about', '/models', '/periodontitis/index.html', '/head-neck/scc/index.html']) {
    await page.goto(path);
    const header = page.locator('header').first();
    await expect(header.getByRole('link', { name: 'Model collection' }), `${path}: links sit behind the menu`).toBeHidden();
    await header.getByRole('button', { name: 'Open navigation' }).click();
    await expect(header.getByRole('link', { name: 'Model collection' }), path).toBeVisible();
    await expect(header.getByRole('link', { name: 'Students' }), `${path}: same labels as desktop`).toBeVisible();
  }
});

test('static model pages use the site top bar on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/oroantral/index.html');
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(nav.getByRole('link')).toHaveText(['How it works', 'Model collection', 'Evidence', 'Create', 'Students', 'About']);
  await expect(page.locator('header #theme')).toBeVisible();
  // Languages in their own names, alphabetical by English name; Chinese is not translated yet.
  await expect(languageButton(page)).toHaveAccessibleName('Language: English');
  await languageButton(page).click();
  await expect(page.locator('header #langs li button .vt-name')).toHaveText(['中文', 'English', '日本語', 'Tiếng Việt']);
  await expect(page.locator('header #langs li button img.vt-flag')).toHaveCount(4);
  await expect(page.locator('header #langs li button[aria-disabled="true"]')).toHaveCount(1);
});
