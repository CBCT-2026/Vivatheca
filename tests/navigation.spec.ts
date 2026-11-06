import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

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
const staticPages = readdirSync('public', { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join('public', entry.name, 'index.html')))
  // The local server needs index.html spelled out; production serves /<name>/.
  .map((entry) => `/${entry.name}/index.html`);

test('every page has a logo in its header that links to the homepage', async ({ page }) => {
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
